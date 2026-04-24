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
    <div className={`${bgColor} rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isHighlight ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 shadow-indigo-200/50 dark:shadow-none shadow-xl border-none' : 'hover:border-indigo-100 dark:hover:border-slate-700 group'}`}>
      <div className="flex items-start justify-between w-full mb-4">
        <div className="min-w-0 flex-1 pr-4"> {/* Added min-w-0 and padding to prevent text overlapping icon */}
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isHighlight ? 'text-indigo-100/80' : 'text-slate-400 dark:text-slate-500'}`}>{title}</p>

          {/* ADDED truncate here */}
          <h3 className={`text-2xl font-black tracking-tight truncate ${isHighlight ? 'text-white' : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors'}`}>
            {symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>

          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${isHighlight ? 'bg-white/20 text-white' : `${(trendColor || 'text-slate-500').replace('text-', 'bg-').replace('-500', '-50')} ${trendColor || 'text-slate-500'} dark:bg-opacity-10 opacity-90`}`}>
              {trend}
            </div>
          )}
        </div>
        <div className={`shrink-0 p-3.5 rounded-2xl transition-all duration-500 ${isHighlight ? 'bg-white/20 text-white rotate-3 group-hover:rotate-0' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 group-hover:-rotate-3'}`}>
          {icon}
        </div>
      </div>

      {subStats && subStats.length > 0 && (
        <div className={`mt-6 pt-5 border-t border-dashed ${isHighlight ? 'border-white/20' : 'border-slate-100 dark:border-slate-800'} flex justify-between gap-4`}>
          {subStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col min-w-0"> {/* Added min-w-0 */}
              <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 truncate ${isHighlight ? 'text-indigo-100/60' : 'text-slate-400 dark:text-slate-500'}`}>
                {stat.label}
              </span>
              <span className={`text-xs font-black truncate ${isHighlight ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
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