import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  DollarSign
} from 'lucide-react';

import {
  CURRENCIES
} from './constants';
import {
  BudgetItem,
  TransactionType,
  SavingsGoal,
  Account,
  Category
} from './types';

// Components
import { DashboardCard } from './components/DashboardCard';
import { TransactionsTable } from './components/TransactionsTable';
import { AIAdvisor } from './components/AIAdvisor';
import { AddTransactionModal } from './components/AddTransactionModal';
import { BudgetView } from './components/BudgetView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { AddGoalModal } from './components/AddGoalModal';
import { SpendingBreakdown } from './components/SpendingBreakdown';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { NotificationToast } from './components/NotificationToast';
import { NewMonthModal } from './components/NewMonthModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { CashFlowSummary } from './components/CashFlowSummary';
import { AccountsView } from './components/AccountsView';
import { AddAccountModal } from './components/AddAccountModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { MonthlyPlanView } from './components/MonthlyPlanView';

// Hooks
import { useFinanceData } from './hooks/useFinanceData';

const App: React.FC = () => {
  const {
    items, setItems,
    goals, setGoals,
    accounts, setAccounts,
    categories, setCategories,
    settings, setSettings,
    filteredItems,
    summary,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleBulkDeleteTransactions,
    handleSaveAccount,
    handleDeleteAccount,
    handleSaveGoal,
    handleDeleteGoal
  } = useFinanceData();

  console.log(`[App] Rendering with ${items.length} items (${filteredItems.length} filtered)`);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('wealthflow_theme') === 'dark' ||
    (!localStorage.getItem('wealthflow_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Additional UI State
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => localStorage.getItem('wealthflow_autosync') === 'true');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ isVisible: boolean, message: string }>({ isVisible: false, message: '' });

  const showToast = (message: string) => {
    setToastConfig({ isVisible: true, message });
    setTimeout(() => setToastConfig({ isVisible: false, message: '' }), 3000);
  };

  const onToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('wealthflow_theme', nextMode ? 'dark' : 'light');
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]); // Fixed minor React dependency warning here

  const hasApiKey = !!localStorage.getItem('wealthflow_ai_key');

  const spendingInsights = useMemo(() => {
    const end = new Date(settings.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { daysLeft: Math.max(1, days) };
  }, [settings.endDate]);

  const expenseData = useMemo(() => {
    const cats: Record<string, { value: number, subs: Record<string, number> }> = {};
    const filtered = filteredItems.filter(i => i.type === TransactionType.EXPENSE || i.type === TransactionType.FIXED_EXPENSE);
    
    filtered.forEach(item => {
      const catName = item.category || 'Other';
      if (!cats[catName]) {
        cats[catName] = { value: 0, subs: {} };
      }
      cats[catName].value += item.actualAmount;
      if (item.subCategory) {
        cats[catName].subs[item.subCategory] = (cats[catName].subs[item.subCategory] || 0) + item.actualAmount;
      }
    });

    const total = Object.values(cats).reduce((sum, val) => sum + val.value, 0);
    
    return Object.entries(cats).map(([name, data]) => ({
      name,
      value: data.value,
      percent: total > 0 ? (data.value / total) * 100 : 0,
      subCategories: data.subs
    })).sort((a, b) => b.value - a.value);
  }, [filteredItems]);

  const onManualSave = () => {
    setSyncStatus('syncing');
    showToast('Saving changes...');
    setTimeout(() => {
      setSyncStatus('success');
      showToast('Changes saved successfully!');
    }, 1000);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const onBackup = () => {
    const data = { items, goals, accounts, categories, settings };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup created!');
  };

  const onRestoreClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const content = JSON.parse(re.target?.result as string);
          if (content.items) setItems(content.items);
          if (content.goals) setGoals(content.goals);
          if (content.accounts) setAccounts(content.accounts);
          if (content.categories) setCategories(content.categories);
          if (content.settings) setSettings(content.settings);
          showToast('Data restored successfully!');
        } catch (err) {
          showToast('Failed to restore backup');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportFromGitHub = (data: any) => {
    setItems(data.items);
    setGoals(data.goals);
    setSettings(data.settings);
    setAccounts(data.accounts);
    setCategories(data.categories);
    showToast('Data synced from GitHub!');
  };

  const currentCurrency = CURRENCIES.find(c => c.code === settings.baseCurrency) || CURRENCIES[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={hasApiKey}
        onOpenKeySelection={() => { }}
        onOpenCategoryManager={() => setShowCategoryManager(true)}
        autoSyncEnabled={autoSyncEnabled}
        syncStatus={syncStatus}
        onOpenGitHubModal={() => setShowGitHubModal(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        onManualSave={onManualSave}
        onOpenNewMonthModal={() => setShowNewMonthModal(true)}
        onBackup={onBackup}
        onRestoreClick={onRestoreClick}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsSidebarOpen(true)}
          onAddTransaction={() => setShowTransactionModal(true)}
          currentCurrency={currentCurrency}
          summary={summary}
          spendingInsights={spendingInsights}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="w-full space-y-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <DashboardCard
                    title="Total Income"
                    amount={summary.totalIncome}
                    symbol={currentCurrency.symbol}
                    icon={<ArrowUpRight size={24} className="text-emerald-500" />}
                  />
                  <DashboardCard
                    title="Total Expenses"
                    amount={summary.totalExpenses}
                    symbol={currentCurrency.symbol}
                    icon={<ArrowDownRight size={24} className="text-rose-500" />}
                  />
                  <DashboardCard
                    title="Total Savings"
                    amount={summary.totalSavings}
                    symbol={currentCurrency.symbol}
                    icon={<PiggyBank size={24} className="text-indigo-500" />}
                  />
                  <DashboardCard
                    title="Balance"
                    amount={summary.balance}
                    symbol={currentCurrency.symbol}
                    icon={<DollarSign size={24} className="text-white" />}
                    bgColor="bg-indigo-600 dark:bg-indigo-500 text-white"
                    isHighlight={true}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column - Main Analytics */}
                  <div className="lg:col-span-8 space-y-8">
                    <SpendingBreakdown
                      data={expenseData}
                      symbol={currentCurrency.symbol}
                      isDarkMode={isDarkMode}
                      categories={categories}
                    />

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Recent Activity</h3>
                        <button
                          onClick={() => setActiveTab('transactions')}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <TransactionsTable
                        title="Recent Activity"
                        items={filteredItems.slice(0, 10)}
                        symbol={currentCurrency.symbol}
                        onEdit={(item: BudgetItem) => { setEditingItem(item); setShowTransactionModal(true); }}
                        onDelete={handleDeleteTransaction}
                        onBulkDelete={handleBulkDeleteTransactions}
                        accounts={accounts}
                        categories={categories}
                        hasApiKey={hasApiKey}
                        // 👇 FIX 1: Connecting Dashboard import to state
                        onAddMultipleTransactions={(newItems) => {
                          setItems(prevItems => [...newItems, ...prevItems]);
                          showToast(`Successfully imported ${newItems.length} transactions!`);
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Column - Secondary Data */}
                  <div className="lg:col-span-4 space-y-8">
                    <CashFlowSummary summary={summary} symbol={currentCurrency.symbol} />

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                      <SavingsGoalsView
                        goals={goals.slice(0, 3)}
                        items={items}
                        symbol={currentCurrency.symbol}
                        onAddGoal={() => setShowGoalModal(true)}
                        onEditGoal={(g) => { setEditingGoal(g); setShowGoalModal(true); }}
                        onDeleteGoal={handleDeleteGoal}
                        onAddSavings={() => setShowTransactionModal(true)}
                      />
                      {goals.length > 3 && (
                        <button
                          onClick={() => setActiveTab('goals')}
                          className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          View {goals.length - 3} more goals
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <TransactionsTable
                title="Financial History"
                items={filteredItems}
                symbol={currentCurrency.symbol}
                onEdit={(item: BudgetItem) => { setEditingItem(item); setShowTransactionModal(true); }}
                onDelete={handleDeleteTransaction}
                onBulkDelete={handleBulkDeleteTransactions}
                accounts={accounts}
                categories={categories}
                hasApiKey={hasApiKey}
                className="h-full"
                // 👇 FIX 2: Connecting Transactions Page import to state
                onAddMultipleTransactions={(newItems) => {
                  setItems(prevItems => [...newItems, ...prevItems]);
                  showToast(`Successfully imported ${newItems.length} transactions!`);
                }}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetView
                items={filteredItems}
                symbol={currentCurrency.symbol}
                categories={categories}
                onSetBudget={() => { }} // Integration needed
                onRemoveBudget={() => { }}
                onAddBudget={() => { }}
              />
            )}
            {activeTab === 'monthly-plan' && (
  <MonthlyPlanView 
    items={filteredItems} 
    symbol={currentCurrency.symbol} 
  />
)}

            {activeTab === 'accounts' && (
              <AccountsView
                accounts={accounts}
                items={items}
                symbol={currentCurrency.symbol}
                onAddAccount={() => setShowAccountModal(true)}
                onEditAccount={(acc) => { setEditingAccount(acc); setShowAccountModal(true); }}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeTab === 'advisor' && (
              <AIAdvisor
                data={filteredItems}
                summary={summary}
                onKeyRequest={() => { }}
              />
            )}

            {activeTab === 'summary' && (
              <MonthlySummaryView
                items={items}
                symbol={currentCurrency.symbol}
                isDarkMode={isDarkMode}
                categories={categories}
              />
            )}

            {activeTab === 'goals' && (
              <SavingsGoalsView
                goals={goals}
                items={items}
                symbol={currentCurrency.symbol}
                onAddGoal={() => setShowGoalModal(true)}
                onEditGoal={(g) => { setEditingGoal(g); setShowGoalModal(true); }}
                onDeleteGoal={handleDeleteGoal}
                onAddSavings={() => setShowTransactionModal(true)}
              />
            )}
          </div>
        </main>

        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <AddTransactionModal
        isOpen={showTransactionModal}
        symbol={currentCurrency.symbol}
        onClose={() => { setShowTransactionModal(false); setEditingItem(null); }}
        onSave={handleSaveTransaction}
        initialData={editingItem}
        onDelete={() => {
          if (editingItem) {
            handleDeleteTransaction(editingItem.id);
            setShowTransactionModal(false);
            setEditingItem(null);
          }
        }}
        accounts={accounts}
        categories={categories}
      />

      <AddGoalModal
        isOpen={showGoalModal}
        symbol={currentCurrency.symbol}
        onClose={() => { setShowGoalModal(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
        onDelete={() => {
          if (editingGoal) {
            handleDeleteGoal(editingGoal.id);
            setShowGoalModal(false);
            setEditingGoal(null);
          }
        }}
        categories={categories}
      />

      <AddAccountModal
        isOpen={showAccountModal}
        symbol={currentCurrency.symbol}
        onClose={() => { setShowAccountModal(false); setEditingAccount(null); }}
        onSave={handleSaveAccount}
        initialData={editingAccount}
      />

      <CategoryManagerModal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onSave={(cat: Category) => setCategories(prev => [...prev, cat])}
        onDelete={(id: string) => setCategories(prev => prev.filter(c => c.id !== id))}
      />

      <GitHubSyncModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        currentData={{ items, goals, settings, accounts, categories } as any}
        onImport={handleImportFromGitHub}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={setAutoSyncEnabled}
      />

      <NewMonthModal
        isOpen={showNewMonthModal}
        currentStartDate={settings.startDate}
        onClose={() => setShowNewMonthModal(false)}
        onConfirm={() => { }} // Integration needed
      />

      <NotificationToast
        isVisible={toastConfig.isVisible}
        message={toastConfig.message}
        onClose={() => setToastConfig({ isVisible: false, message: '' })}
      />
    </div>
  );
};

export default App;
