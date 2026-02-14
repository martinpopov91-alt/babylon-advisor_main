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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Spending Breakdown</h3>
      </div>

      <div className="relative h-[200px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={5}
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
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
              formatter={(value: number) => `${symbol}${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Central Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {symbol}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Detailed Legend List */}
      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {data.length > 0 ? data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-500">{getCategoryIcon(item.name)}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {item.percent.toFixed(1)}%
              </p>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-slate-400 dark:text-slate-600 text-sm italic">
            No expenses tracked yet
          </div>
        )}
      </div>
    </div>
  );
};