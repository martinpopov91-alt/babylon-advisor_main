import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import { Category } from '../types.ts';
import { CATEGORY_ICONS_MAP } from '../constants.ts';

interface BreakdownItem {
  name: string;
  value: number;
  percent: number;
}

interface SpendingBreakdownProps {
  data: BreakdownItem[];
  symbol: string;
  isDarkMode: boolean;
  categories: Category[];
}

const COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({ data, symbol, isDarkMode, categories }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    const IconComponent = cat ? CATEGORY_ICONS_MAP[cat.icon] : MoreHorizontal;
    return IconComponent ? <IconComponent size={14} /> : <MoreHorizontal size={14} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Spending Breakdown</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 flex-1 overflow-hidden">
        <div className="relative h-[220px] w-[220px] lg:h-[260px] lg:w-[260px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="85%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                formatter={(value: number) => `${symbol}${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Central Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Spent</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {symbol}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Detailed Legend List */}
        <div className="flex-1 w-full space-y-3.5 overflow-y-auto max-h-[300px] md:max-h-full pr-2 custom-scrollbar">
          {data.length > 0 ? data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between group py-1 border-b border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-md flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors">{getCategoryIcon(item.name)}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {item.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 w-8">
                    {item.percent.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm italic">
              No expenses tracked yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};