import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { SummaryData } from '../types.ts';

interface CashFlowSummaryProps {
  summary: SummaryData;
  symbol: string;
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({ summary, symbol }) => {
  const { totalIncome, totalExpenses, totalSavings, balance } = summary;
  const totalOutflow = totalExpenses + totalSavings;
  const netCashFlow = balance;

  // Calculate percentages relative to the larger value (Income or Outflow) to set the scale
  const base = Math.max(totalIncome, totalOutflow) || 1;
  
  const incomePct = (totalIncome / base) * 100;
  const expensesPct = (totalExpenses / base) * 100;
  const savingsPct = (totalSavings / base) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">Cash Flow Summary</h3>
      
      <div className="space-y-6">
          {/* Income Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-600 dark:text-slate-400">Inflow</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{symbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${incomePct}%` }}></div>
            </div>
          </div>

          {/* Outflow Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-600 dark:text-slate-400">Outflow</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{symbol}{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
             <div className="flex h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${expensesPct}%` }} title="Expenses"></div>
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${savingsPct}%` }} title="Savings"></div>
            </div>
            <div className="flex justify-end gap-4 mt-2 text-[10px] font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Expenses</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Savings</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Net Cash Flow</p>
                    <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {netCashFlow >= 0 ? '+' : ''}{symbol}{netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                 <div className={`p-3 rounded-xl ${netCashFlow >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {netCashFlow >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};