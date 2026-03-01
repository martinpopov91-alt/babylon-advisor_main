import { GoogleGenAI } from "@google/genai";
import { BudgetItem, SummaryData } from "../types.ts";

const getSystemPrompt = (data: BudgetItem[], summary: SummaryData) => {
  return `
You are a world-class financial advisor and data analyst for a budgeting app called "WealthFlow".
The user has provided their current month's cash flow data.

Your goal is to help them understand their finances, find ways to save, and identify spending patterns.
You have access to a sophisticated reasoning process to analyze complex queries deeply.

Current Financial Snapshot:
- Total Income: ${summary.totalIncome.toFixed(2)}
- Total Savings: ${summary.totalSavings.toFixed(2)}
- Total Expenses: ${summary.totalExpenses.toFixed(2)}
- Variable Expenses (included in total): ${summary.variableExpenses.toFixed(2)}
- Net Balance: ${summary.balance.toFixed(2)}

Detailed Transaction List:
${JSON.stringify(data.map(item => ({
    name: item.name,
    amount: item.actualAmount,
    type: item.type,
    category: item.category || 'N/A',
    date: item.date
})), null, 2)}

Instructions:
1. When asked about specific numbers, be precise.
2. If asked for advice, analyze the categories (e.g., too much spent on "Dining Out" vs "Savings").
3. Use markdown for formatting tables or lists.
4. If the user asks a complex question, use your reasoning capabilities to break down the calculation and trade-offs.
5. If the user's balance is negative, suggest immediate areas for reduction based on the variable expenses list.
`;
};

export const generateFinancialAdvice = async (
  prompt: string,
  data: BudgetItem[],
  summary: SummaryData
): Promise<string> => {
  try {
    // Ensure we create a new instance with the latest pre-configured key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: getSystemPrompt(data, summary),
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
      },
    });

    if (!response || !response.text) {
      return "I processed your request but couldn't formulate a text response. Please try rephrasing.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes("Requested entity was not found")) {
      return "ACTION_REQUIRED: Your selected API key doesn't seem to have access to Gemini 3 Pro. Please select a project with billing enabled.";
    }
    
    if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("401") || errorMsg.includes("403")) {
      return "ACTION_REQUIRED: There is an issue with your API Key. Please ensure you have selected a valid project with billing enabled via the 'Enable AI Features' button.";
    }

    return `Sorry, I encountered an error: ${errorMsg}. Please try again in a moment.`;
  }
};