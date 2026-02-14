import React, { useMemo } from 'react';
import { Trash2, Pencil, Shield, ShoppingCart, PiggyBank, Plus, Wallet } from 'lucide-react';
import { BudgetItem, TransactionType, Category } from '../types.ts';
import { CATEGORY_ICONS_MAP } from '../constants.ts';

interface BudgetViewProps {
  items: BudgetItem[];
  symbol: string;
  onSetBudget: (category: string) => void;
  onRemoveBudget: (category: string) => void;
  onAddBudget: () => void;
  categories: Category[];
}

interface BudgetGroupCardProps {
  group: any;
  symbol: string;
  onSetBudget: (category: string) => void;
  onRemoveBudget: (category: string) => void;
}

const BudgetGroupCard: React.FC<BudgetGroupCardProps> = ({ group, symbol, onSetBudget, onRemoveBudget }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-xl ${group.bgClass} ${group.colorClass}`}>
        <group.icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{group.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{group.subtitle}</p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {symbol}{group.totalActual.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} 
          <span className="text-slate-400 font-normal mx-1">/</span>
          <span className="text-slate-500 dark:text-slate-400">{symbol}{group.totalPlanned.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {group.items.map((item: any) => {
        const hasBudget = item.planned > 0;
        const percentage = hasBudget ? Math.min((item.actual / item.planned) * 100, 100) : 0;
        const isOverBudget = hasBudget && item.actual > item.planned;
        const remaining = Math.max(item.planned - item.actual, 0);
        const IconComponent = item.icon || Wallet;
        
        return (
          <div key={item.name} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden">
            {/* Context Actions */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg p-1">
              <button 
                onClick={() => onSetBudget(item.name)} 
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                title="Edit Budget"
              >
                <Pencil size={14} />
              </button>
              {hasBudget && (
                <button 
                  onClick={() => onRemoveBudget(item.name)} 
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                  title="Remove Budget"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover/card:scale-110 transition-transform duration-300`}>
                  <IconComponent size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.name}</h4>
                  {!hasBudget && (
                    <button 
                      onClick={() => onSetBudget(item.name)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Plus size={10} /> Set Budget
                    </button>
                  )}
                </div>
              </div>
            </div>

            {hasBudget ? (
              <>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spent</span>
                    <span className={`text-sm font-bold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {symbol}{item.actual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Limit</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {symbol}{item.planned.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`absolute h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : group.barClass}`} 
                    style={{ width: `${percentage}%` }} 
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-slate-400">
                    {percentage.toFixed(0)}% used
                  </span>
                  <span className={`text-xs font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isOverBudget ? `Over by ${symbol}${(item.actual - item.planned).toLocaleString()}` : `${symbol}${remaining.toLocaleString()} left`}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                 <div className="text-xs text-slate-500">Spent: <span className="font-bold text-slate-700 dark:text-slate-300">{symbol}{item.actual.toLocaleString()}</span></div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">Unbudgeted</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export const BudgetView: React.FC<BudgetViewProps> = ({ items, symbol, onSetBudget, onRemoveBudget, onAddBudget, categories }) => {
  
  const totalIncome = useMemo(() => 
    items.filter(i => i.type === TransactionType.INCOME).reduce((sum, i) => sum + i.actualAmount, 0),
  [items]);

  const { groups, totalPlanned, totalActual } = useMemo(() => {
    // 1. Gather all unique categories in the current items
    const uniqueCategories = new Set<string>();
    items.forEach(item => {
      if (item.type !== TransactionType.INCOME) {
        uniqueCategories.add(item.category);
      }
    });

    // Ensure all known categories are also included to prompt budgeting
    categories.forEach(cat => {
      if (cat.types.length === 1 && cat.types[0] === TransactionType.INCOME) return;
      uniqueCategories.add(cat.name);
    });

    const categoryStats: Record<string, { planned: number; actual: number; type: TransactionType }> = {};

    // 2. Aggregate data
    uniqueCategories.forEach(catName => {
        categoryStats[catName] = { planned: 0, actual: 0, type: TransactionType.EXPENSE }; // Default type
    });

    items.forEach(item => {
      if (item.type === TransactionType.INCOME) return;
      
      const stats = categoryStats[item.category];
      if (stats) {
        stats.planned += item.plannedAmount;
        stats.actual += item.actualAmount;
        // Prioritize specific types found in items over generic default
        if (item.type !== TransactionType.EXPENSE) {
             stats.type = item.type; 
        }
      }
    });

    // 3. Configure Groups
    const groupsConfig = {
      fixed: { 
        id: 'fixed',
        title: 'Fixed Expenses', 
        subtitle: 'Bills, Subscriptions & Commitments',
        items: [] as any[], 
        totalPlanned: 0, 
        totalActual: 0, 
        icon: Shield, 
        colorClass: 'text-amber-600 dark:text-amber-400', 
        bgClass: 'bg-amber-100 dark:bg-amber-900/20', 
        barClass: 'bg-amber-500' 
      },
      variable: { 
        id: 'variable',
        title: 'Variable Spending', 
        subtitle: 'Day-to-day Lifestyle Expenses',
        items: [] as any[], 
        totalPlanned: 0, 
        totalActual: 0, 
        icon: ShoppingCart, 
        colorClass: 'text-indigo-600 dark:text-indigo-400', 
        bgClass: 'bg-indigo-100 dark:bg-indigo-900/20', 
        barClass: 'bg-indigo-500' 
      },
      savings: { 
        id: 'savings',
        title: 'Savings & Investments', 
        subtitle: 'Future Goals & Wealth Building',
        items: [] as any[], 
        totalPlanned: 0, 
        totalActual: 0, 
        icon: PiggyBank, 
        colorClass: 'text-emerald-600 dark:text-emerald-400', 
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/20', 
        barClass: 'bg-emerald-500' 
      }
    };

    // 4. Distribute categories to groups
    uniqueCategories.forEach(catName => {
      const stats = categoryStats[catName];
      const catDef = categories.find(c => c.name === catName);
      
      // Determine Type: 
      let finalType = stats.type;
      
      // Upgrade type based on definition if generic
      if (catDef && finalType === TransactionType.EXPENSE) {
         if (catDef.types.includes(TransactionType.FIXED_EXPENSE)) finalType = TransactionType.FIXED_EXPENSE;
         else if (catDef.types.includes(TransactionType.SAVING)) finalType = TransactionType.SAVING;
      }

      let groupKey: 'fixed' | 'variable' | 'savings' = 'variable';
      if (finalType === TransactionType.SAVING) groupKey = 'savings';
      else if (finalType === TransactionType.FIXED_EXPENSE) groupKey = 'fixed';

      // Icon Resolution
      const Icon = catDef ? CATEGORY_ICONS_MAP[catDef.icon] : Wallet;

      const item = {
        name: catName,
        icon: Icon,
        ...stats
      };

      groupsConfig[groupKey].items.push(item);
      groupsConfig[groupKey].totalPlanned += stats.planned;
      groupsConfig[groupKey].totalActual += stats.actual;
    });

    const sortFn = (a: any, b: any) => {
      if (a.planned > 0 && b.planned === 0) return -1;
      if (a.planned === 0 && b.planned > 0) return 1;
      if (a.actual > 0 && b.actual === 0) return -1;
      if (a.actual === 0 && b.actual > 0) return 1;
      return b.actual - a.actual;
    };

    groupsConfig.fixed.items.sort(sortFn);
    groupsConfig.variable.items.sort(sortFn);
    groupsConfig.savings.items.sort(sortFn);

    const totalPlanned = groupsConfig.fixed.totalPlanned + groupsConfig.variable.totalPlanned + groupsConfig.savings.totalPlanned;
    const totalActual = groupsConfig.fixed.totalActual + groupsConfig.variable.totalActual + groupsConfig.savings.totalActual;

    return { groups: Object.values(groupsConfig), totalPlanned, totalActual };
  }, [items, categories]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <Wallet size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Budget Overview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monthly Allocation & Health</p>
              </div>
            </div>
            
            <button 
              onClick={onAddBudget}
              className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
            >
              <Plus size={18} />
              <span>Create Budget</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="px-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Income</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{symbol}{totalIncome.toLocaleString()}</p>
              <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg w-fit">
                Current Inflow
              </div>
            </div>
            
            <div className="px-2 pt-6 md:pt-0 md:pl-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Budgeted</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{symbol}{totalPlanned.toLocaleString()}</p>
                {totalIncome > 0 && (
                   <span className="text-sm font-bold text-slate-400">/ {((totalPlanned/totalIncome)*100).toFixed(0)}% of income</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Allocated to Expenses & Savings</p>
            </div>

            <div className="px-2 pt-6 md:pt-0 md:pl-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
              <div className="flex items-baseline gap-2">
                 <p className={`text-3xl font-bold ${totalActual > totalPlanned ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
                   {symbol}{totalActual.toLocaleString()}
                 </p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                 <div 
                    className={`h-full rounded-full ${totalActual > totalPlanned ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min((totalActual/Math.max(totalPlanned, 1))*100, 100)}%` }} 
                 />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">
                {totalActual > totalPlanned ? 'Over Budget' : `${symbol}${(totalPlanned - totalActual).toLocaleString()} Remaining`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Groups */}
      <div className="space-y-12">
        {groups.map(group => (
          <BudgetGroupCard 
            key={group.id} 
            group={group} 
            symbol={symbol}
            onSetBudget={onSetBudget}
            onRemoveBudget={onRemoveBudget}
          />
        ))}
      </div>
    </div>
  );
};