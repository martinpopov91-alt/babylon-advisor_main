import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  PieChart as PieIcon,
  Plus,
  Target,
  Download,
  Upload,
  Settings,
  Sun,
  Moon,
  BarChart3,
  MoreHorizontal,
  Key,
  AlertCircle,
  Menu,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Save,
  Github,
  X,
  Landmark,
  Tag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { INITIAL_DATA, INITIAL_GOALS, DEFAULT_CATEGORIES, CURRENCIES, INITIAL_ACCOUNTS, CATEGORY_ICONS_MAP } from './constants.ts';
import { BudgetItem, TransactionType, SummaryData, SavingsGoal, AppSettings, Account, Category } from './types.ts';
import { DashboardCard } from './components/DashboardCard.tsx';
import { TransactionsTable } from './components/TransactionsTable.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { AddTransactionModal } from './components/AddTransactionModal.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { SavingsGoalsView } from './components/SavingsGoalsView.tsx';
import { AddGoalModal } from './components/AddGoalModal.tsx';
import { SpendingBreakdown } from './components/SpendingBreakdown.tsx';
import { MonthlySummaryView } from './components/MonthlySummaryView.tsx';
import { ConfirmationModal } from './components/ConfirmationModal.tsx';
import { NotificationToast } from './components/NotificationToast.tsx';
import { SetBudgetModal } from './components/SetBudgetModal.tsx';
import { NewMonthModal } from './components/NewMonthModal.tsx';
import { GitHubSyncModal } from './components/GitHubSyncModal.tsx';
import { CashFlowSummary } from './components/CashFlowSummary.tsx';
import { Logo } from './components/Logo.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { AddAccountModal } from './components/AddAccountModal.tsx';
import { CategoryManagerModal } from './components/CategoryManagerModal.tsx';

type TabType = 'dashboard' | 'transactions' | 'budget' | 'goals' | 'advisor' | 'summary' | 'accounts';

const getLocalYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const App: React.FC = () => {
  // Robust parsing to prevent white screens from corrupted data
  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      
      const parsed = JSON.parse(saved);
      
      // Strict type check: If fallback is array, parsed MUST be array
      if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        console.warn(`Data mismatch for ${key}: expected array, got ${typeof parsed}. Reverting to default.`);
        return fallback;
      }
      
      return parsed;
    } catch (e) {
      console.warn(`Error parsing ${key} from storage`, e);
      return fallback;
    }
  };

  const getUrlParams = () => {
    try {
      if (typeof window === 'undefined' || !window.location) {
         return { tab: null, from: null, to: null, cur: null };
      }
      const params = new URLSearchParams(window.location.search);
      return {
        tab: params.get('tab') as TabType | null,
        from: params.get('from'),
        to: params.get('to'),
        cur: params.get('cur')
      };
    } catch (e) {
      return { tab: null, from: null, to: null, cur: null };
    }
  };

  const urlParams = getUrlParams();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthflow_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return false;
    }
  });

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
    // Default to current month start/end safely avoiding timezone bug
    const firstDay = getLocalYYYYMMDD(new Date(now.getFullYear(), now.getMonth(), 1));
    const lastDay = getLocalYYYYMMDD(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    
    return {
      startDate: urlParams.from || persisted.startDate || firstDay,
      endDate: urlParams.to || persisted.endDate || lastDay,
      baseCurrency: urlParams.cur || persisted.baseCurrency || 'EUR'
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('wealthflow_active_tab');
    return urlParams.tab || (savedTab as TabType) || 'dashboard';
  });

  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<string | undefined>(undefined);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType | undefined>(undefined);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  
  // Account Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  // Category Manager Modal
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<{name: string, currentAmount: number, type: TransactionType} | null>(null);

  // New Month Modal State
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // UI State for Modal & Toast
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [toastConfig, setToastConfig] = useState<{
    isVisible: boolean;
    message: string;
    onUndo?: () => void;
  }>({
    isVisible: false,
    message: '',
  });

  const showToast = (message: string, onUndo?: () => void) => {
    setToastConfig({ isVisible: true, message, onUndo });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  // Backfill legacy transactions if they have no accountId
  useEffect(() => {
    if (accounts.length > 0) {
      let needsUpdate = false;
      const defaultAccountId = accounts.find(a => a.isDefault)?.id || accounts[0].id;
      
      const updatedItems = items.map(item => {
        if (!item.accountId) {
          needsUpdate = true;
          return { ...item, accountId: defaultAccountId };
        }
        return item;
      });

      if (needsUpdate) {
        setItems(updatedItems);
      }
    }
  }, [accounts]); // Intentionally don't depend on items to avoid loops, rely on accounts load

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleManualSave = () => {
    try {
      localStorage.setItem('wealthflow_items', JSON.stringify(items));
      localStorage.setItem('wealthflow_goals', JSON.stringify(goals));
      localStorage.setItem('wealthflow_settings', JSON.stringify(settings));
      localStorage.setItem('wealthflow_accounts', JSON.stringify(accounts));
      localStorage.setItem('wealthflow_categories', JSON.stringify(categories));
      showToast('All changes saved successfully!');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Save failed", error);
      showToast('Failed to save changes.');
    }
  };

  const handleBackup = () => {
    const backupData = JSON.stringify({ items, goals, settings, accounts, categories }, null, 2);
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealthflow_backup_${getLocalYYYYMMDD(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsMobileMenuOpen(false);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.items && Array.isArray(content.items)) {
          setItems(content.items);
          if (content.goals) setGoals(content.goals);
          if (content.settings) setSettings(content.settings);
          if (content.accounts) setAccounts(content.accounts);
          if (content.categories) setCategories(content.categories);
          alert('Data restored successfully!');
          setIsMobileMenuOpen(false);
        } else {
          alert('Invalid file format. Please use a valid WealthFlow backup.');
        }
      } catch (err) {
        alert('Error reading file. Make sure it is a valid JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportFromGitHub = (content: any) => {
    if (content.items && Array.isArray(content.items)) {
      setItems(content.items);
      if (content.goals) setGoals(content.goals);
      if (content.settings) setSettings(content.settings);
      if (content.accounts) setAccounts(content.accounts);
      if (content.categories) setCategories(content.categories);
      showToast('Data synced from GitHub successfully!');
      setIsGitHubModalOpen(false);
    } else {
      alert('Invalid data format from GitHub.');
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('wealthflow_active_tab', activeTab);
      localStorage.setItem('wealthflow_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save to localStorage:", e);
    }

    try {
      if (typeof window !== 'undefined' && window.history && window.location) {
        const params = new URLSearchParams();
        params.set('tab', activeTab);
        params.set('from', settings.startDate);
        params.set('to', settings.endDate);
        params.set('cur', settings.baseCurrency);
        
        try {
          const newRelativePathQuery = window.location.pathname + '?' + params.toString();
          window.history.replaceState(null, '', newRelativePathQuery);
        } catch(e) {
          // Ignore history errors in sandboxed environments
        }
      }
    } catch (e) {
      console.debug("Could not update URL history:", e);
    }
  }, [activeTab, settings]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wealthflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wealthflow_theme', 'light');
    }
  }, [isDarkMode]);

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

  const currentCurrency = useMemo(() => {
    return CURRENCIES.find(c => c.code === settings.baseCurrency) || CURRENCIES[0];
  }, [settings.baseCurrency]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return item.date >= settings.startDate && item.date <= settings.endDate;
    });
  }, [items, settings.startDate, settings.endDate]);

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    const [y, m, d] = settings.startDate.split('-');
    const current = new Date(Number(y), Number(m) - 1, Number(d));
    
    if (direction === 'prev') {
      current.setMonth(current.getMonth() - 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
    
    const newStart = getLocalYYYYMMDD(new Date(current.getFullYear(), current.getMonth(), 1));
    const newEnd = getLocalYYYYMMDD(new Date(current.getFullYear(), current.getMonth() + 1, 0));

    setSettings(prev => ({ ...prev, startDate: newStart, endDate: newEnd }));
  };

  const handleConfirmNewMonth = (newStart: string, newEnd: string, mode: 'rollover' | 'blank') => {
    if (mode === 'blank') {
      setItems(prev => prev.filter(item => item.date < newStart || item.date > newEnd));
      showToast('Started a blank new period. Past history preserved!');
    } else {
      const templates = items.filter(item => {
        const inCurrentView = item.date >= settings.startDate && item.date <= settings.endDate;
        const hasBudget = item.plannedAmount > 0;
        const isRecurring = !!item.recurrence;
        return inCurrentView && (hasBudget || isRecurring);
      });

      if (templates.length > 0) {
        const existingNextPeriodItems = items.filter(i => 
          i.date >= newStart && i.date <= newEnd
        );

        const newItems: BudgetItem[] = [];
        const [yStr, mStr, dStr] = newStart.split('-');
        const targetDateObj = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));

        templates.forEach(template => {
          let newDateStr = newStart;
          
          try {
            const [oldY, oldM, oldD] = template.date.split('-');
            const oldDate = new Date(Number(oldY), Number(oldM) - 1, Number(oldD));
            const day = oldDate.getDate();
            const targetDate = new Date(targetDateObj.getFullYear(), targetDateObj.getMonth(), day);
            
            if (targetDate.getMonth() !== targetDateObj.getMonth()) {
              targetDate.setDate(0); 
            }
            newDateStr = getLocalYYYYMMDD(targetDate);
          } catch (e) {
            newDateStr = newStart;
          }

          const isDuplicate = existingNextPeriodItems.some(ex => 
            ex.name === template.name && 
            ex.category === template.category && 
            Math.abs(ex.plannedAmount - template.plannedAmount) < 0.01
          );

          if (!isDuplicate) {
            newItems.push({
              ...template,
              id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date: newDateStr,
              actualAmount: 0,
              accountId: template.accountId // Keep account assignment
            });
          }
        });

        if (newItems.length > 0) {
          setItems(prev => [...prev, ...newItems]);
        }
      }
      showToast('Started new period and rolled over previous budgets!');
    }

    setSettings(prev => ({ ...prev, startDate: newStart, endDate: newEnd }));
    setIsNewMonthModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const summary = useMemo<SummaryData>(() => {
    const income = filteredItems
      .filter(i => i.type === TransactionType.INCOME)
      .reduce((sum, i) => sum + i.actualAmount, 0);
    
    const savings = filteredItems
      .filter(i => i.type === TransactionType.SAVING)
      .reduce((sum, i) => sum + i.actualAmount, 0);
      
    const fixedExpenses = filteredItems
      .filter(i => i.type === TransactionType.FIXED_EXPENSE)
      .reduce((sum, i) => sum + i.actualAmount, 0);

    const variableExpenses = filteredItems
      .filter(i => i.type === TransactionType.EXPENSE)
      .reduce((sum, i) => sum + i.actualAmount, 0);

    const totalSpent = fixedExpenses + variableExpenses;

    return {
      totalIncome: income,
      totalSavings: savings,
      totalExpenses: totalSpent, 
      variableExpenses,
      balance: income - (totalSpent + savings)
    };
  }, [filteredItems]);

  const spendingInsights = useMemo(() => {
    const [ey, em, ed] = settings.endDate.split('-');
    const end = new Date(Number(ey), Number(em) - 1, Number(ed), 23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const safeDiffDays = Math.max(1, diffDays);
    
    const daily = summary.balance > 0 ? summary.balance / safeDiffDays : 0;
    const weekly = daily * 7;
    
    return {
      daysLeft: safeDiffDays,
      dailyBudget: daily,
      weeklyBudget: weekly
    };
  }, [summary.balance, settings.endDate]);

  const expenseData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredItems.filter(i => i.type === TransactionType.EXPENSE || i.type === TransactionType.FIXED_EXPENSE).forEach(item => {
      const cat = item.category || 'Other';
      categories[cat] = (categories[cat] || 0) + item.actualAmount;
    });
    const sorted = Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const totalSpent = sorted.reduce((sum, [, val]) => sum + val, 0);
    
    return sorted.map(([name, value]) => ({
      name,
      value,
      percent: totalSpent > 0 ? (value / totalSpent) * 100 : 0
    }));
  }, [filteredItems]);

  const budgetChartData = useMemo(() => {
    const categoryData: Record<string, { planned: number, actual: number }> = {};
    filteredItems.forEach(item => {
      if (item.type === TransactionType.EXPENSE || item.type === TransactionType.FIXED_EXPENSE) {
        if (!categoryData[item.category]) {
          categoryData[item.category] = { planned: 0, actual: 0 };
        }
        categoryData[item.category].planned += item.plannedAmount;
        categoryData[item.category].actual += item.actualAmount;
      }
    });
    return Object.entries(categoryData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);
  }, [filteredItems]);

  const recentTransactions = useMemo(() => {
    return [...filteredItems].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [filteredItems]);

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    const IconComponent = cat ? CATEGORY_ICONS_MAP[cat.icon] : MoreHorizontal;
    return <IconComponent size={16} />;
  };

  // Category Handlers
  const handleSaveCategory = (category: Category) => {
    setCategories(prev => {
      const existing = prev.findIndex(c => c.id === category.id);
      if (existing >= 0) {
        const newCats = [...prev];
        newCats[existing] = category;
        return newCats;
      }
      return [...prev, category];
    });
    showToast(`Category "${category.name}" saved`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category deleted');
  };

  // Account Handlers
  const handleSaveAccount = (accountData: Omit<Account, 'id'>) => {
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...accountData, id: a.id, isDefault: a.isDefault } : a));
    } else {
      const newAccount = { 
        ...accountData, 
        id: `acc-${Date.now()}`,
        isDefault: accounts.length === 0 
      };
      setAccounts(prev => [...prev, newAccount]);
    }
    setEditingAccount(null);
    setIsAccountModalOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    const accToDelete = accounts.find(a => a.id === id);
    if (!accToDelete) return;
    if (accToDelete.isDefault) {
      showToast('Cannot delete the default account.');
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: 'Delete Account?',
      message: `Are you sure you want to delete "${accToDelete.name}"? Transactions linked to this account will remain but be unassigned.`,
      onConfirm: () => {
        setAccounts(prev => prev.filter(a => a.id !== id));
        showToast('Account deleted');
      }
    });
  };

  const handleSaveTransaction = (itemData: Omit<BudgetItem, 'id'>) => {
    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...itemData, id: item.id } : item));
    } else {
      const id = `man-${Date.now()}`;
      const transaction: BudgetItem = { ...itemData, id };
      setItems(prev => [transaction, ...prev]);
    }
    closeTransactionModal();
  };

  const handleEditTransaction = (item: BudgetItem) => {
    setEditingItem(item);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    if (!itemToDelete) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Delete Transaction?',
      message: `Are you sure you want to delete "${itemToDelete.name}"? This action can be undone.`,
      onConfirm: () => {
        setItems(prev => prev.filter(item => item.id !== id));
        showToast('Transaction deleted', () => {
          setItems(prev => [...prev, itemToDelete]);
        });
      }
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: `Delete ${ids.length} Transactions?`,
      message: 'Are you sure you want to delete these selected transactions? This action can be undone.',
      onConfirm: () => {
        const deletedItems = items.filter(item => ids.includes(item.id));
        setItems(prev => prev.filter(item => !ids.includes(item.id)));
        showToast(`${ids.length} transactions deleted`, () => {
          setItems(prev => [...prev, ...deletedItems]);
        });
      }
    });
  };

  const handleSetBudget = (category: string) => {
    const periodItems = filteredItems.filter(i => i.category === category);
    const currentAmount = periodItems.reduce((sum, i) => sum + i.plannedAmount, 0);
    const budgetItem = periodItems.find(i => i.plannedAmount > 0);
    const type = budgetItem ? budgetItem.type : (periodItems[0]?.type || TransactionType.EXPENSE);

    setEditingBudgetCategory({ name: category, currentAmount, type });
    setIsBudgetModalOpen(true);
  };

  const handleCreateNewBudget = () => {
    setEditingBudgetCategory({ name: '', currentAmount: 0, type: TransactionType.EXPENSE });
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = (oldCategory: string | null, newCategory: string, amount: number, type: TransactionType) => {
    const itemsSnapshot = [...items];
    
    setItems(prev => {
      let updatedItems = prev.map(item => {
        if (oldCategory && item.category === oldCategory && item.date >= settings.startDate && item.date <= settings.endDate) {
          return { ...item, category: newCategory };
        }
        return item;
      });

      let budgetSet = false;
      
      updatedItems = updatedItems.map(item => {
        const inPeriod = item.date >= settings.startDate && item.date <= settings.endDate;
        if (inPeriod && item.category === newCategory) {
          if (!budgetSet && (item.plannedAmount > 0 || item.actualAmount === 0)) {
            budgetSet = true;
            return { ...item, plannedAmount: amount, type: type }; 
          } else if (item.plannedAmount > 0) {
             return { ...item, plannedAmount: 0, type: type };
          }
          return { ...item, type: type }; 
        }
        return item;
      });

      if (!budgetSet) {
        // Need to assign a budget item to an account. Pick default.
        const defaultAccountId = accounts.find(a => a.isDefault)?.id || accounts[0]?.id;
        updatedItems.push({
          id: `budget-${Date.now()}`,
          name: `${newCategory} Budget`,
          plannedAmount: amount,
          actualAmount: 0,
          type: type,
          category: newCategory,
          date: settings.startDate,
          accountId: defaultAccountId
        });
      }

      return updatedItems;
    });

    const action = oldCategory && oldCategory !== newCategory ? 'renamed & updated' : 'updated';
    showToast(`Budget for ${newCategory} ${action}`, () => setItems(itemsSnapshot));
  };

  const handleRemoveBudget = (category: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete Budget for ${category}?`,
      message: 'This will remove the budget limit. If there are no transactions, the category will be removed entirely.',
      onConfirm: () => {
        const itemsSnapshot = [...items]; 
        setItems(prev => {
           return prev.filter(item => {
             const inPeriod = item.date >= settings.startDate && item.date <= settings.endDate;
             if (inPeriod && item.category === category) {
               if (item.actualAmount === 0) {
                 return false;
               }
             }
             return true;
           }).map(item => {
             const inPeriod = item.date >= settings.startDate && item.date <= settings.endDate;
             if (inPeriod && item.category === category) {
               return { ...item, plannedAmount: 0 };
             }
             return item;
           });
        });
        showToast(`Budget deleted for ${category}`, () => {
          setItems(itemsSnapshot);
        });
      }
    });
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setTimeout(() => { setEditingItem(null); setModalDefaultCategory(undefined); setModalDefaultType(undefined); }, 200);
  };

  const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    if (editingGoal) {
       setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...goalData, id: g.id } : g));
    } else {
       const newGoal: SavingsGoal = { ...goalData, id: `goal-${Date.now()}` };
       setGoals(prev => [...prev, newGoal]);
    }
    closeGoalModal();
  };
  
  const handleDeleteGoal = (id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (!goalToDelete) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Delete Savings Goal?',
      message: `Are you sure you want to delete "${goalToDelete.name}"?`,
      onConfirm: () => {
        setGoals(prev => prev.filter(g => g.id !== id));
        showToast('Goal deleted', () => {
          setGoals(prev => [...prev, goalToDelete]);
        });
      }
    });
  };

  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setTimeout(() => setEditingGoal(null), 200);
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const BottomNavItem = ({ tab, icon: Icon, label }: { tab: TabType, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)} 
      className={`flex flex-col items-center justify-center p-2 min-w-[50px] transition-all duration-200 ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      <Icon size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />
      <span className="text-[10px] font-bold mt-1 tracking-tight">{label}</span>
    </button>
  );

  const formatCurrentMonth = () => {
    if (!settings.startDate) return '';
    const [y, m, d] = settings.startDate.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Logo className="h-8 w-8 text-indigo-600 dark:text-indigo-400" variant={1} />
            <span className="text-xl font-bold tracking-tight">Babylon Advisor</span>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('accounts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'accounts' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Landmark size={20} /> Accounts
          </button>
          <button onClick={() => setActiveTab('summary')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'summary' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <BarChart3 size={20} /> Monthly Summary
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'transactions' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <CreditCard size={20} /> Transactions
          </button>
          <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'budget' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <PieIcon size={20} /> Budget Plan
          </button>
          <button onClick={() => setActiveTab('goals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'goals' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Target size={20} /> Savings Goals
          </button>
          <button onClick={() => setActiveTab('advisor')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'advisor' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <TrendingUp size={20} /> AI Advisor
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
           {!hasApiKey && (
             <button 
               onClick={handleOpenKeySelection}
               className="w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-800/50 transition-all hover:bg-amber-100 dark:hover:bg-amber-800/40"
             >
               <Key size={16} /> Enable AI Features
             </button>
           )}
           <button 
             onClick={() => setIsCategoryManagerOpen(true)}
             className="w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
           >
             <Tag size={16} /> Manage Categories
           </button>
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Appearance</h4>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
           </div>
           <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Data Management</h4>
           <div className="grid grid-cols-2 gap-2">
              <button onClick={handleManualSave} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all" title="Save All Changes"><Save size={20} className="mb-1" /><span className="text-[10px] font-medium text-center leading-tight">Save</span></button>
              <button onClick={() => setIsNewMonthModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all" title="Start New Month"><RefreshCw size={20} className="mb-1" /><span className="text-[10px] font-medium text-center leading-tight">New Month</span></button>
              <button onClick={handleBackup} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all"><Download size={20} className="mb-1" /><span className="text-[10px] font-medium text-center leading-tight">Backup</span></button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all"><Upload size={20} className="mb-1" /><span className="text-[10px] font-medium text-center leading-tight">Restore</span></button>
              <button onClick={() => setIsGitHubModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all" title="GitHub Sync"><Github size={20} className="mb-1" /><span className="text-[10px] font-medium text-center leading-tight">Sync</span></button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleRestore} />
           </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-shrink-0 relative z-20 transition-colors">
          <div className="flex items-center gap-3">
             <div className="md:hidden text-indigo-600 dark:text-indigo-400">
               <Logo className="h-6 w-6" variant={1} />
             </div>
             <h1 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">
               {activeTab === 'summary' ? 'Summary' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
             </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <button 
               onClick={() => setIsMobileMenuOpen(true)} 
               className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
                <Menu size={20} />
             </button>
             <button onClick={() => { setEditingItem(null); setIsTransactionModalOpen(true); }} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
                <Plus size={18} /> <span className="hidden sm:inline">Add Transaction</span>
             </button>
             <div className="text-right hidden md:block pl-4 border-l border-slate-200 dark:border-slate-800">
               <p className="text-sm text-slate-500 dark:text-slate-400">Left to Spend</p>
               <div className="flex items-center gap-2">
                 <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currentCurrency.symbol}{summary.balance.toLocaleString()}</p>
                 <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">{spendingInsights.daysLeft}d left</span>
               </div>
             </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 p-6 flex flex-col md:hidden animate-in slide-in-from-top-5 duration-300">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Logo className="h-8 w-8" variant={1} />
                  <span className="text-xl font-bold">Babylon Advisor</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                 <X size={24} />
               </button>
             </div>

             <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Theme</span>
                  <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    {isDarkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
                  </button>
               </div>
               
               <button 
                 onClick={() => { setIsMobileMenuOpen(false); setIsCategoryManagerOpen(true); }}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-800 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
               >
                 <Tag size={18} /> Manage Categories
               </button>

               <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Data Management</h4>
                 <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleManualSave} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-800 transition-all">
                     <Save size={24} className="mb-2 text-indigo-500" />
                     <span className="text-xs font-bold">Save</span>
                   </button>
                   <button onClick={() => { setIsNewMonthModalOpen(true); }} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-800 transition-all">
                     <RefreshCw size={24} className="mb-2 text-emerald-500" />
                     <span className="text-xs font-bold">New Period</span>
                   </button>
                   <button onClick={handleBackup} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-800 transition-all">
                     <Download size={24} className="mb-2 text-blue-500" />
                     <span className="text-xs font-bold">Backup File</span>
                   </button>
                   <button onClick={() => { setIsMobileMenuOpen(false); setIsGitHubModalOpen(true); }} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-800 transition-all">
                     <Github size={24} className="mb-2 text-slate-700 dark:text-slate-300" />
                     <span className="text-xs font-bold">Cloud Sync</span>
                   </button>
                 </div>
               </div>
               
               <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                 <Upload size={18} /> Restore from File
               </button>
             </div>
          </div>
        )}

        {!hasApiKey && activeTab === 'advisor' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
            <div className="flex items-start gap-3 text-amber-800 dark:text-amber-200 text-sm font-medium">
              <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 mt-0.5" />
              <div>
                <p>Gemini 3 Pro thinking requires a paid API key selection.</p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-amber-900 dark:hover:text-amber-100">Learn about billing</a>
              </div>
            </div>
            <button 
              onClick={handleOpenKeySelection}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm w-full sm:w-auto"
            >
              Configure Key
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm relative z-10 transition-colors">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
             {/* Month Navigation for History */}
             <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700/60">
                <button 
                  onClick={() => handleNavigateMonth('prev')}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
                  {formatCurrentMonth()}
                </span>
                <button 
                  onClick={() => handleNavigateMonth('next')}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
             </div>

             <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                 <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Start</label>
                 <input type="date" value={settings.startDate} onChange={(e) => setSettings(s => ({ ...s, startDate: e.target.value }))} className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none text-slate-800 dark:text-slate-200 w-28 focus:ring-1 focus:ring-indigo-500"/>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                 <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">End</label>
                 <input type="date" value={settings.endDate} onChange={(e) => setSettings(s => ({ ...s, endDate: e.target.value }))} className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none text-slate-800 dark:text-slate-200 w-28 focus:ring-1 focus:ring-indigo-500"/>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-slate-400" />
              <select value={settings.baseCurrency} onChange={(e) => setSettings(s => ({ ...s, baseCurrency: e.target.value }))} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-transparent border-none focus:ring-0 cursor-pointer">
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>
            {/* Mobile Summary Link */}
            <div className="sm:hidden">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`text-xs font-bold ${activeTab === 'summary' ? 'text-indigo-600' : 'text-slate-500'}`}
              >
                Summary View
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <DashboardCard title="Total Income" amount={summary.totalIncome} symbol={currentCurrency.symbol} icon={<ArrowUpRight size={24} className="text-emerald-500" />} />
                  <DashboardCard title="Total Expenses" amount={summary.totalExpenses} symbol={currentCurrency.symbol} icon={<ArrowDownRight size={24} className="text-rose-500" />} />
                  <DashboardCard title="Total Savings" amount={summary.totalSavings} symbol={currentCurrency.symbol} icon={<PiggyBank size={24} className="text-indigo-500 dark:text-indigo-400" />} />
                  <DashboardCard title="Left to Spend" amount={summary.balance} symbol={currentCurrency.symbol} icon={<DollarSign size={24} className="text-white" />} bgColor="bg-indigo-600 text-white" isHighlight={true} subStats={[{ label: "Daily", value: spendingInsights.dailyBudget }, { label: "Weekly", value: spendingInsights.weeklyBudget }, { label: "Days Left", value: spendingInsights.daysLeft, isCurrency: false }]} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                      <div className="flex justify-between items-center mb-6">
                        <div><h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Budget Performance</h3><p className="text-xs text-slate-500 dark:text-slate-400">Selected period vs budget</p></div>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={budgetChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                            <XAxis dataKey="name" tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `${currentCurrency.symbol}${v}`} />
                            <RechartsTooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: '8px', border: 'none'}} />
                            <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle"/>
                            <Bar name="Planned" dataKey="planned" fill={isDarkMode ? "#475569" : "#cbd5e1"} radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar name="Actual" dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                       <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">Recent Activity</h3>
                       <div className="space-y-4">
                         {recentTransactions.length > 0 ? recentTransactions.map(item => (
                             <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group" onClick={() => handleEditTransaction(item)}>
                               <div className="flex items-center gap-4">
                                 <div className={`p-2.5 rounded-full ${item.type === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : item.type === TransactionType.SAVING ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{getCategoryIcon(item.category)}</div>
                                 <div className="min-w-0"><p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.date} • {item.category}</p></div>
                               </div>
                               <span className={`font-bold text-sm whitespace-nowrap ml-2 ${item.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : item.type === TransactionType.SAVING ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.type === TransactionType.INCOME ? '+' : '-'}{currentCurrency.symbol}{item.actualAmount.toFixed(2)}</span>
                             </div>
                           )) : <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No activity in this period</div>}
                       </div>
                    </div>
                  </div>
                  <div className="space-y-6 md:space-y-8">
                    <CashFlowSummary summary={summary} symbol={currentCurrency.symbol} />
                    <SpendingBreakdown data={expenseData} symbol={currentCurrency.symbol} isDarkMode={isDarkMode} categories={categories} />
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                      <h3 className="font-bold text-lg mb-2 relative z-10">Need Financial Advice?</h3>
                      <p className="text-indigo-100 text-sm mb-6 relative z-10">Our AI Advisor can analyze your spending patterns and help you save more effectively.</p>
                      <button onClick={() => setActiveTab('advisor')} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors relative z-10 shadow-lg">Ask AI Advisor</button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                       <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">Savings Progress</h3>
                       <div className="space-y-5">
                         {goals.slice(0, 3).map(goal => {
                            const saved = filteredItems.filter(i => i.type === TransactionType.SAVING && i.category === goal.category).reduce((sum, i) => sum + i.actualAmount, 0) + goal.initialAmount;
                            const percent = Math.min((saved / goal.targetAmount) * 100, 100);
                            return (
                              <div key={goal.id}>
                                <div className="flex justify-between text-sm mb-1.5"><span className="font-medium text-slate-700 dark:text-slate-200">{goal.name}</span><span className="text-slate-500 dark:text-slate-400 text-xs">{percent.toFixed(0)}%</span></div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: goal.color }}></div></div>
                              </div>
                            );
                         })}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'summary' && (
              <div className="animate-in fade-in duration-300">
                <MonthlySummaryView items={items} symbol={currentCurrency.symbol} isDarkMode={isDarkMode} categories={categories} />
              </div>
            )}
            {activeTab === 'accounts' && (
              <div className="animate-in fade-in duration-300">
                <AccountsView 
                  accounts={accounts} 
                  items={items} 
                  symbol={currentCurrency.symbol} 
                  onAddAccount={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
                  onEditAccount={(acc) => { setEditingAccount(acc); setIsAccountModalOpen(true); }}
                  onDeleteAccount={handleDeleteAccount}
                />
              </div>
            )}
            {activeTab === 'transactions' && (
              <div className="h-full animate-in fade-in duration-300">
                <TransactionsTable 
                  title="Filtered History" 
                  items={filteredItems} 
                  symbol={currentCurrency.symbol} 
                  onEdit={handleEditTransaction} 
                  onDelete={handleDeleteTransaction} 
                  onBulkDelete={handleBulkDelete} 
                  className="h-full" 
                  accounts={accounts}
                  categories={categories}
                />
              </div>
            )}
            {activeTab === 'budget' && (
              <div className="animate-in fade-in duration-300">
                <BudgetView 
                  items={filteredItems} 
                  symbol={currentCurrency.symbol} 
                  onSetBudget={handleSetBudget} 
                  onRemoveBudget={handleRemoveBudget} 
                  onAddBudget={handleCreateNewBudget}
                  categories={categories}
                />
              </div>
            )}
            {activeTab === 'goals' && (
              <div className="animate-in fade-in duration-300">
                <SavingsGoalsView goals={goals} items={filteredItems} symbol={currentCurrency.symbol} onAddGoal={() => setIsGoalModalOpen(true)} onEditGoal={(g) => { setEditingGoal(g); setIsGoalModalOpen(true); }} onDeleteGoal={handleDeleteGoal} onAddSavings={(g) => { setModalDefaultCategory(g.category); setModalDefaultType(TransactionType.SAVING); setIsTransactionModalOpen(true); }} />
              </div>
            )}
            {activeTab === 'advisor' && (
              <div className="max-w-4xl mx-auto w-full h-full animate-in fade-in duration-300">
                <AIAdvisor data={filteredItems} summary={summary} onKeyRequest={handleOpenKeySelection} />
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-2 pb-[env(safe-area-inset-bottom,20px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex justify-around items-center h-16">
              <BottomNavItem tab="dashboard" icon={LayoutDashboard} label="Home" />
              <BottomNavItem tab="accounts" icon={Landmark} label="Accts" />
              <BottomNavItem tab="transactions" icon={CreditCard} label="Txns" />
              <BottomNavItem tab="budget" icon={PieIcon} label="Budget" />
              <BottomNavItem tab="advisor" icon={TrendingUp} label="AI" />
           </div>
        </div>
        
        <AddTransactionModal 
          isOpen={isTransactionModalOpen} 
          symbol={currentCurrency.symbol} 
          onClose={closeTransactionModal} 
          onSave={handleSaveTransaction} 
          initialData={editingItem} 
          defaultCategory={modalDefaultCategory} 
          defaultType={modalDefaultType} 
          onDelete={editingItem ? () => { closeTransactionModal(); handleDeleteTransaction(editingItem.id); } : undefined}
          accounts={accounts}
          categories={categories}
        />
        <AddGoalModal 
          isOpen={isGoalModalOpen} 
          symbol={currentCurrency.symbol} 
          onClose={closeGoalModal} 
          onSave={handleSaveGoal} 
          initialData={editingGoal} 
          onDelete={editingGoal ? () => { closeGoalModal(); handleDeleteGoal(editingGoal.id); } : undefined}
          categories={categories}
        />
        
        <AddAccountModal
          isOpen={isAccountModalOpen}
          symbol={currentCurrency.symbol}
          onClose={() => setIsAccountModalOpen(false)}
          onSave={handleSaveAccount}
          initialData={editingAccount}
        />

        <SetBudgetModal
          isOpen={isBudgetModalOpen}
          symbol={currentCurrency.symbol}
          category={editingBudgetCategory?.name || ''}
          currentAmount={editingBudgetCategory?.currentAmount || 0}
          currentType={editingBudgetCategory?.type}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={handleSaveBudget}
        />

        <NewMonthModal
          isOpen={isNewMonthModalOpen}
          currentStartDate={settings.startDate}
          onClose={() => setIsNewMonthModalOpen(false)}
          onConfirm={handleConfirmNewMonth}
        />
        
        <GitHubSyncModal
          isOpen={isGitHubModalOpen}
          onClose={() => setIsGitHubModalOpen(false)}
          currentData={{ items, goals, settings, accounts, categories } as any}
          onImport={handleImportFromGitHub}
        />
        
        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categories={categories}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
        />

        <ConfirmationModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        />
        
        <NotificationToast 
          isVisible={toastConfig.isVisible}
          message={toastConfig.message}
          onUndo={toastConfig.onUndo}
          onClose={() => setToastConfig(prev => ({ ...prev, isVisible: false }))}
        />

      </main>
    </div>
  );
};

export default App;