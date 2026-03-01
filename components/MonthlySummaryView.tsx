import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  ChevronDown,
  ChevronUp,

  PiggyBank,
  TrendingUp,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { BudgetItem, TransactionType, Category } from '../types.ts';
import { CATEGORY_ICONS_MAP } from '../constants.ts';

interface MonthlySummaryViewProps {
  items: BudgetItem[];
  symbol: string;
  isDarkMode: boolean;
  categories: Category[];
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  net: number;
  categoryBreakdown: Record<string, number>;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({ items, symbol, isDarkMode, categories }) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const monthlyAggregates = useMemo(() => {
    const months: Record<string, MonthlyData> = {};

    items.forEach(item => {
      // Safety check: skip if date is missing or not a string
      if (!item.date || typeof item.date !== 'string') return;

      const monthKey = item.date.substring(0, 7); // YYYY-MM
      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          savings: 0,
          net: 0,
          categoryBreakdown: {}
        };
      }

      const amount = Number(item.actualAmount) || 0;

      if (item.type === TransactionType.TRANSFER) return; // Skip transfers in summary reports

      if (item.type === TransactionType.INCOME) {
        months[monthKey].income += amount;
      } else if (item.type === TransactionType.SAVING) {
        months[monthKey].savings += amount;
      } else {
        months[monthKey].expenses += amount;
        const cat = item.category || 'Other';
        months[monthKey].categoryBreakdown[cat] = (months[monthKey].categoryBreakdown[cat] || 0) + amount;
      }
    });

    Object.values(months).forEach(m => {
      const income = Number(m.income) || 0;
      const expenses = Number(m.expenses) || 0;
      const savings = Number(m.savings) || 0;
      m.net = income - (expenses + savings);
    });

    return Object.values(months).sort((a, b) => b.month.localeCompare(a.month));
  }, [items]);

  const chartData = useMemo(() => {
    return [...monthlyAggregates]
      .reverse()
      .map(m => {
        // Safe local parsing to avoid UTC shifts
        const [y, month] = m.month.split('-');
        // Using day 15 is safer than day 1 for avoiding month-boundary timezone issues when formatting locally
        const dateObj = new Date(Number(y), Number(month) - 1, 15);
        const formattedName = isNaN(dateObj.getTime())
          ? m.month
          : dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        return {
          name: formattedName,
          income: m.income,
          expenses: m.expenses,
          savings: m.savings
        };
      });
  }, [monthlyAggregates]);

  const formatMonthName = (monthStr: string) => {
    const [y, month] = monthStr.split('-');
    // Using day 15 prevents potential previous-month glitches in negative timezones
    const date = new Date(Number(y), Number(month) - 1, 15);
    if (isNaN(date.getTime())) return monthStr;
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    const IconComponent = cat ? CATEGORY_ICONS_MAP[cat.icon] : MoreHorizontal;
    return IconComponent ? <IconComponent size={14} /> : <MoreHorizontal size={14} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Performance Over Time</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly breakdown of income vs spending</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v}`} />
                <Tooltip cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: '8px', border: 'none' }} />
                <Legend iconType="circle" />
                <Bar name="Income" dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar name="Expenses" dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar name="Savings" dataKey="savings" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              Add some transactions to see your performance chart
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 px-1">Monthly Records</h3>
        {monthlyAggregates.length > 0 ? monthlyAggregates.map((month) => {
          const isExpanded = expandedMonth === month.month;
          const isHealthy = Number(month.net) >= 0;
          const incomeValue = Number(month.income);
          const savingsRatio = incomeValue > 0 ? (Number(month.savings) / incomeValue) : 0;
          const savingsPercent = Number(savingsRatio) * 100;

          return (
            <div key={month.month} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
              <div className={`p-6 flex flex-wrap items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`} onClick={() => setExpandedMonth(isExpanded ? null : month.month)}>
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl"><Calendar size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{formatMonthName(month.month)}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${isHealthy ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>{isHealthy ? 'SURPLUS' : 'DEFICIT'}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{isHealthy ? '+' : ''}{symbol}{Number(month.net).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 md:gap-12 flex-1 justify-end mr-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Income</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{symbol}{Number(month.income).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expenses</p>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{symbol}{Number(month.expenses).toLocaleString()}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{symbol}{Number(month.savings).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-slate-400">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
              </div>
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Spending by Category</h5>
                      <div className="space-y-3">
                        {Object.entries(month.categoryBreakdown).sort((a, b) => Number(b[1]) - Number(a[1])).map(([name, amount]) => {
                          const currentAmount = Number(amount);
                          const totalExpenses = Number(month.expenses);
                          const categoryPercent = totalExpenses > 0 ? (currentAmount / totalExpenses) * 100 : 0;
                          return (
                            <div key={name}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">{getCategoryIcon(name)}</span><span className="text-slate-700 dark:text-slate-300 font-medium">{name}</span></div>
                                <div className="text-right"><span className="text-sm font-bold text-slate-800 dark:text-slate-100">{symbol}{currentAmount.toLocaleString()}</span></div>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500/50 rounded-full" style={{ width: `${categoryPercent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Savings Efficiency</h5>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{savingsPercent.toFixed(1)}%</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">of total income</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {savingsPercent >= 20 ? 'Excellent! You are hitting the recommended savings rate.' :
                            savingsPercent >= 10 ? 'Good work, you are building your future wealth.' :
                              'Consider reviewing small daily expenses to increase your savings rate.'}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><PiggyBank size={20} /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Assets Built</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{symbol}{Number(month.savings).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="p-12 text-center text-slate-400 italic">No monthly data available yet</div>
        )}
      </div>
    </div>
  );
};