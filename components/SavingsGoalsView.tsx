import React from 'react';
import { Plus, Target, Calendar, Trophy, ArrowRight, Trash2, Pencil, Infinity, TrendingUp } from 'lucide-react';
import { BudgetItem, SavingsGoal, TransactionType } from '../types.ts';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  items: BudgetItem[];
  symbol: string;
  onAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onAddSavings: (goal: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({ 
  goals, 
  items, 
  symbol,
  onAddGoal, 
  onEditGoal,
  onDeleteGoal, 
  onAddSavings 
}) => {
  const calculateProgress = (goal: SavingsGoal) => {
    const savingsFromTransactions = items
      .filter(item => 
        item.type === TransactionType.SAVING && 
        item.category === goal.category && 
        (!goal.subCategory || item.subCategory === goal.subCategory)
      )
      .reduce((sum, item) => sum + item.actualAmount, 0);

    const totalSaved = goal.initialAmount + savingsFromTransactions;
    const hasTarget = goal.targetAmount > 0;
    
    const percentage = hasTarget ? Math.min((totalSaved / goal.targetAmount) * 100, 100) : 0;
    const remaining = hasTarget ? Math.max(goal.targetAmount - totalSaved, 0) : 0;
    
    return { totalSaved, percentage, remaining, hasTarget };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Savings Goals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your progress and build wealth</p>
        </div>
        <button 
          onClick={onAddGoal} 
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <Target size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No goals yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">Create a savings goal to start tracking your progress towards your dreams.</p>
          <button onClick={onAddGoal} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">Create your first goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const { totalSaved, percentage, remaining, hasTarget } = calculateProgress(goal);
            const isCompleted = hasTarget && totalSaved >= goal.targetAmount;

            return (
              <div key={goal.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 overflow-hidden">
                
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-800/30 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: goal.color }}>
                        {hasTarget ? <Target size={22} /> : <Infinity size={22} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight line-clamp-1" title={goal.name}>{goal.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {goal.category} {goal.subCategory && `• ${goal.subCategory}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEditGoal(goal)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => onDeleteGoal(goal.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
                        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{symbol}{totalSaved.toLocaleString()}</span>
                      </div>
                      {hasTarget && (
                        <div className="text-right">
                           <span className={`text-sm font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                             {percentage.toFixed(0)}%
                           </span>
                        </div>
                      )}
                    </div>

                    {hasTarget ? (
                      <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : ''}`} 
                          style={{ width: `${percentage}%`, backgroundColor: isCompleted ? undefined : goal.color }} 
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
                        <TrendingUp size={16} className="text-emerald-500" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Open-ended savings growth</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    {hasTarget ? (
                      isCompleted ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                          <Trophy size={12} /> Goal Reached!
                        </span>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{symbol}{remaining.toLocaleString()}</span>
                        </>
                      )
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Started</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {goal.initialAmount > 0 ? `${symbol}${goal.initialAmount.toLocaleString()}` : 'From zero'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {(!hasTarget || !isCompleted) && (
                    <button 
                      onClick={() => onAddSavings(goal)} 
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-600 px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
                    >
                      <Plus size={14} /> Add Funds
                    </button>
                  )}
                </div>
                
                {goal.deadline && (
                  <div className="absolute top-0 left-0 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-br-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-r border-white dark:border-slate-900">
                    <Calendar size={10} /> {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};