import { useState, useMemo, useEffect } from 'react';
import { BudgetItem, TransactionType, SummaryData, SavingsGoal, AppSettings, Account, Category } from '../types';
import { INITIAL_DATA, INITIAL_GOALS, DEFAULT_CATEGORIES, INITIAL_ACCOUNTS } from '../constants';

const getLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const safeParse = <T,>(key: string, fallback: T): T => {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return fallback;
        const parsed = JSON.parse(saved);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
        return parsed;
    } catch (e) {
        return fallback;
    }
};

export const useFinanceData = () => {
    const [items, setItems] = useState<BudgetItem[]>(() =>
        safeParse('wealthflow_items', INITIAL_DATA)
    );
    const [goals, setGoals] = useState<SavingsGoal[]>(() =>
        safeParse('wealthflow_goals', INITIAL_GOALS)
    );
    const [accounts, setAccounts] = useState<Account[]>(() =>
        safeParse('wealthflow_accounts', INITIAL_ACCOUNTS)
    );
    const [categories, setCategories] = useState<Category[]>(() =>
        safeParse('wealthflow_categories', DEFAULT_CATEGORIES)
    );
    const [settings, setSettings] = useState<AppSettings>(() => {
        const persisted = safeParse<Partial<AppSettings>>('wealthflow_settings', {});
        const now = new Date();
        const firstDay = getLocalYYYYMMDD(new Date(now.getFullYear(), now.getMonth(), 1));
        const lastDay = getLocalYYYYMMDD(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        return {
            startDate: persisted.startDate || firstDay,
            endDate: persisted.endDate || lastDay,
            baseCurrency: persisted.baseCurrency || 'EUR'
        };
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('wealthflow_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('wealthflow_goals', JSON.stringify(goals));
    }, [goals]);

    useEffect(() => {
        localStorage.setItem('wealthflow_accounts', JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        localStorage.setItem('wealthflow_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('wealthflow_settings', JSON.stringify(settings));
    }, [settings]);

    // Derived Values
    const filteredItems = useMemo(() => {
        return items.filter(item => item.date >= settings.startDate && item.date <= settings.endDate);
    }, [items, settings.startDate, settings.endDate]);

    const summary = useMemo<SummaryData>(() => {
        const income = filteredItems
            .filter(i => i.type === TransactionType.INCOME)
            .reduce((sum: number, i: BudgetItem) => sum + i.actualAmount, 0);
        const savings = filteredItems
            .filter(i => i.type === TransactionType.SAVING)
            .reduce((sum: number, i: BudgetItem) => sum + i.actualAmount, 0);
        const fixedExpenses = filteredItems
            .filter(i => i.type === TransactionType.FIXED_EXPENSE)
            .reduce((sum: number, i: BudgetItem) => sum + i.actualAmount, 0);
        const variableExpenses = filteredItems
            .filter(i => i.type === TransactionType.EXPENSE)
            .reduce((sum: number, i: BudgetItem) => sum + i.actualAmount, 0);
        const totalSpent = fixedExpenses + variableExpenses;

        return {
            totalIncome: income,
            totalSavings: savings,
            totalExpenses: totalSpent,
            variableExpenses,
            balance: income - (totalSpent + savings)
        };
    }, [filteredItems]);

    // Handlers
    const handleSaveTransaction = (itemData: Omit<BudgetItem, 'id'>, id?: string) => {
        if (id) {
            setItems((prev: BudgetItem[]) => prev.map((item: BudgetItem) => item.id === id ? { ...itemData, id } : item));
        } else {
            const newId = `man-${Date.now()}`;
            setItems((prev: BudgetItem[]) => [{ ...itemData, id: newId }, ...prev]);
        }
    };

    const handleDeleteTransaction = (id: string) => {
        setItems((prev: BudgetItem[]) => prev.filter((item: BudgetItem) => item.id !== id));
    };

    const handleSaveAccount = (accountData: Omit<Account, 'id'>, id?: string) => {
        if (id) {
            setAccounts((prev: Account[]) => prev.map((a: Account) => a.id === id ? { ...accountData, id } : a));
        } else {
            const newId = `acc-${Date.now()}`;
            setAccounts((prev: Account[]) => [...prev, { ...accountData, id: newId, isDefault: prev.length === 0 }]);
        }
    };

    const handleDeleteAccount = (id: string) => {
        setAccounts((prev: Account[]) => prev.filter((a: Account) => a.id !== id));
    };

    const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id'>, id?: string) => {
        if (id) {
            setGoals((prev: SavingsGoal[]) => prev.map((g: SavingsGoal) => g.id === id ? { ...goalData, id } : g));
        } else {
            const newId = `goal-${Date.now()}`;
            setGoals((prev: SavingsGoal[]) => [...prev, { ...goalData, id: newId }]);
        }
    };

    const handleDeleteGoal = (id: string) => {
        setGoals((prev: SavingsGoal[]) => prev.filter((g: SavingsGoal) => g.id !== id));
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const [y, m, d] = settings.startDate.split('-');
        const current = new Date(Number(y), Number(m) - 1, Number(d));
        if (direction === 'prev') current.setMonth(current.getMonth() - 1);
        else current.setMonth(current.getMonth() + 1);

        const newStart = getLocalYYYYMMDD(new Date(current.getFullYear(), current.getMonth(), 1));
        const newEnd = getLocalYYYYMMDD(new Date(current.getFullYear(), current.getMonth() + 1, 0));
        setSettings((prev: AppSettings) => ({ ...prev, startDate: newStart, endDate: newEnd }));
    };

    const getCategoryIcon = (categoryName: string) => {
        const cat = categories.find((c: Category) => c.name === categoryName);
        return cat ? cat.icon : 'MoreHorizontal';
    };

    return {
        items, setItems,
        goals, setGoals,
        accounts, setAccounts,
        categories, setCategories,
        settings, setSettings,
        filteredItems,
        summary,
        handleSaveTransaction,
        handleDeleteTransaction,
        handleSaveAccount,
        handleDeleteAccount,
        handleSaveGoal,
        handleDeleteGoal,
        navigateMonth,
        getCategoryIcon
    };
};
