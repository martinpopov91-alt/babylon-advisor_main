import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '../types.ts';
import { CATEGORY_ICONS_MAP } from '../constants.ts';

interface BreakdownItem {
  name: string;
  value: number;
  percent: number;
  subCategories?: Record<string, number>;
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
  const [expandedCats, setExpandedCats] = React.useState<Set<string>>(new Set());
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const toggleCat = (name: string) => {
    const next = new Set(expandedCats);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedCats(next);
  };

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
          {data.length > 0 ? data.map((item, index) => {
            const isExpanded = expandedCats.has(item.name);
            const subEntries = item.subCategories ? Object.entries(item.subCategories).sort((a, b) => b[1] - a[1]) : [];
            const hasSubs = subEntries.length > 0;

            return (
              <div key={item.name} className="space-y-1">
                <div
                  onClick={() => hasSubs && toggleCat(item.name)}
                  className={`flex items-center justify-between group p-2 rounded-xl transition-all cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3 h-3 rounded-md flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors shrink-0">
                        {getCategoryIcon(item.name)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                            {item.name}
                          </span>
                          {hasSubs && (
                            isExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500">
                      {item.percent.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {isExpanded && hasSubs && (
                  <div className="pl-9 pr-2 pb-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
                    {subEntries.map(([subName, subValue]) => (
                      <div key={subName} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{subName}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {symbol}{subValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm italic">
              No expenses tracked yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};