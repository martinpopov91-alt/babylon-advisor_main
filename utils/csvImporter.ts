import { TransactionType, BudgetItem } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple utility to generate random IDs for new transactions
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Parses the raw Bulgarian Bank CSV text and converts it into your app's BudgetItem format.
 */
export const parseBankCSV = (csvText: string, accountId: string, accountName: string): BudgetItem[] => {
    // Split text into lines, remove empty lines, and remove the first row (headers)
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0).slice(1);

    const transactions: BudgetItem[] = [];

    lines.forEach(line => {
        // The bank CSV wraps columns in quotes like: "Data","Description","..."
        // This safely strips the outside quotes and splits by the comma delimiter
        let cleanLine = line;
        if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
            cleanLine = cleanLine.substring(1, cleanLine.length - 1);
        }
        const columns = cleanLine.split('","');

        if (columns.length < 10) return; // Skip invalid rows

        const dateStr = columns[0];         // e.g., "23.04.2026"
        const rawDescription = columns[1];  // e.g., "ПЛАЩАНЕ НА ПОС &lt;br/&gt;..."
        const senderReceiver = columns[2];  // e.g., "BGR SOFIA FANTASTICO"
        const debitStr = columns[8];        // e.g., "13,71" (Expenses)
        const creditStr = columns[9];       // e.g., "839,00" (Incomes)

        // 1. Format Date from DD.MM.YYYY to YYYY-MM-DD
        const dateParts = dateStr.split('.');
        if (dateParts.length !== 3) return;
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        // 2. Clean up Description (Removes HTML tags like <br/> or &lt;br/&gt; and extra spaces)
        let cleanDescription = rawDescription.replace(/&lt;br\s*\/?&gt;|<br\s*\/?>/gi, ' - ').replace(/\s+/g, ' ').trim();

        // If there is a specific Receiver/Sender name, put it at the front for better readability
        if (senderReceiver && senderReceiver.trim() !== '') {
            cleanDescription = `${senderReceiver.trim()} (${cleanDescription})`;
        }

        // 3. Determine Type and Amount (Replace comma with decimal point)
        let type = TransactionType.EXPENSE;
        let amount = 0;

        if (debitStr && debitStr.trim() !== '') {
            type = TransactionType.EXPENSE;
            amount = parseFloat(debitStr.replace(/\s/g, '').replace(',', '.'));
        } else if (creditStr && creditStr.trim() !== '') {
            type = TransactionType.INCOME;
            amount = parseFloat(creditStr.replace(/\s/g, '').replace(',', '.'));
        }

        // 4. Auto-detect Savings or Internal Transfers
        if (accountName.toLowerCase().includes('saving') ||
            accountName.toLowerCase().includes('спест') ||
            cleanDescription.toLowerCase().includes('собствени сметки')) {
            type = TransactionType.SAVING;
        }

        // Only add valid transactions with an amount
        if (amount > 0) {
            transactions.push({
                id: generateId(),
                type,
                plannedAmount: 0,
                actualAmount: amount,
                date: formattedDate,
                name: cleanDescription.substring(0, 100), // Keep names reasonable length
                category: 'Uncategorized', // This will be handled by Gemini!
                accountId: accountId
            } as BudgetItem);
        }
    });

    return transactions;
};

/**
 * Parses Bulgarian Bank SMS/Viber text messages into Transactions.
 */
export const parseBankText = (text: string, accountId: string): BudgetItem[] => {
    const transactions: BudgetItem[] = [];

    // Split the large text block into individual messages
    const messages = text.split('Здравейте').filter(msg => msg.trim().length > 0);

    messages.forEach(msg => {
        // Extract the Date (e.g., "На 30/03/2026")
        const dateMatch = msg.match(/На (\d{2})\/(\d{2})\/(\d{4})/);

        // Extract Action and Amount (e.g., "платени 173.52 EUR", "преведени 20.00 EUR")
        const actionMatch = msg.match(/(платени|преведени|изтеглени)\s+([\d\.]+)\s+(EUR|BGN)/);

        // Extract the Merchant/Address (e.g., "адрес ePay Utilities, Sofia, BG" or "чрез Trading 212")
        const merchantMatch = msg.match(/(?:адрес|чрез)\s+(.*?)(?=\.\s+Наличност|, BG|, BGR|, CY|, IE|, SE)/);

        if (dateMatch && actionMatch && merchantMatch) {
            const formattedDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`; // YYYY-MM-DD
            const amountStr = actionMatch[2];
            const amount = parseFloat(amountStr);
            const actionWord = actionMatch[1]; // платени, преведени, or изтеглени

            let cleanDescription = merchantMatch[1].replace('на ПОС с адрес', '').trim();

            // Determine type: Almost all of these card SMS messages are expenses or transfers out
            let type = TransactionType.EXPENSE;

            // Identify transfers to Trading212/Revolut as "Savings" or "Investments"
            if (cleanDescription.toLowerCase().includes('trading') || cleanDescription.toLowerCase().includes('revolut')) {
                type = TransactionType.SAVING;
            }

            transactions.push({
                id: generateId(),
                type,
                plannedAmount: 0,
                actualAmount: amount,
                date: formattedDate,
                name: cleanDescription.substring(0, 50),
                category: 'Uncategorized', // Ready for Gemini to categorize!
                accountId: accountId
            } as BudgetItem);
        }
    });

    return transactions;
};

/**
 * Sends a list of Uncategorized transactions to Gemini AI to automatically sort them.
 */
export const autoCategorizeTransactions = async (
    transactions: BudgetItem[],
    availableCategories: string[],
    apiKey: string
): Promise<BudgetItem[]> => {
    if (!apiKey) return transactions; // Skip if no API key is provided

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Flash is fast and cheap!

        // Create a compact list for the AI to read
        const transactionList = transactions.map(t => `ID: ${t.id} | Name: ${t.name} | Amount: ${t.actualAmount} | Type: ${t.type}`).join('\n');

        const prompt = `
        You are a highly intelligent financial AI assistant. I have a list of raw bank transactions. 
        Your job is to read the 'Name' and 'Type' of each transaction and assign it to ONE of these categories:
        [${availableCategories.join(', ')}]
        
        Rules:
        - If it's an income (like salary), use an Income category. 
        - If it's a transfer to a savings account or loan payment, use a Savings/Debt category. 
        - Look closely at merchant names (like "FANTASTICO", "ECONT", "OMV") to determine the category.
        - If you aren't sure, use "Other".

        Here are the transactions:
        ${transactionList}

        Respond ONLY with a valid JSON object where the keys are the transaction IDs and the values are the chosen category name. 
        Example: {"id123": "Groceries", "id456": "Salary"}
        Do NOT wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON string.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Clean up AI response in case it added markdown blocks accidentally
        const cleanedJson = responseText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        const categoryMapping = JSON.parse(cleanedJson);

        // Map the newly chosen categories back to the transactions
        return transactions.map(t => ({
            ...t,
            category: categoryMapping[t.id] || t.category
        }));

    } catch (error) {
        console.error("AI Categorization failed:", error);
        return transactions; // If AI fails, return them as "Uncategorized" safely so the app doesn't crash
    }
};
