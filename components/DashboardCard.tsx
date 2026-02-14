import React from 'react';

interface SubStat {
  label: string;
  value: number;
  isCurrency?: boolean;
}

interface DashboardCardProps {
  title: string;
  amount: number;
  symbol: string;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
  bgColor?: string;
  isHighlight?: boolean;
  subStats?: SubStat[];
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  amount, 
  symbol, 
  icon, 
  trend, 
  trendColor, 
  bgColor = "bg-white dark:bg-slate-900",
  isHighlight = false,
  subStats
}) => {
  return (
    <div className={`${bgColor} rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${isHighlight ? 'bg-indigo-600 dark:bg-indigo-700 shadow-indigo-200 dark:shadow-none shadow-lg border-none' : 'hover:border-slate-200 dark:hover:border-slate-700'}`}>
      <div className="flex items-start justify-between w-full mb-2">
        <div>
          <p className={`text-sm font-medium mb-1 ${isHighlight ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
          <h3 className={`text-2xl font-bold ${isHighlight ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${isHighlight ? 'text-indigo-200' : trendColor}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${isHighlight ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          {icon}
        </div>
      </div>

      {subStats && subStats.length > 0 && (
        <div className={`mt-4 pt-4 border-t ${isHighlight ? 'border-white/10' : 'border-slate-100 dark:border-slate-800'} flex justify-between gap-2`}>
          {subStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isHighlight ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {stat.label}
              </span>
              <span className={`text-xs font-bold ${isHighlight ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                {stat.isCurrency !== false ? symbol : ''}
                {stat.value.toLocaleString(undefined, { maximumFractionDigits: stat.isCurrency !== false ? 2 : 0 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};