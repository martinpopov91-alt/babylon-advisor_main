import React, { useState, useEffect } from 'react';
import { X, PieChart, Tag, Hash, Layout } from 'lucide-react';
import { TransactionType } from '../types.ts';

interface SetBudgetModalProps {
  isOpen: boolean;
  symbol: string;
  category: string; // Empty if creating new
  currentAmount: number;
  currentType?: TransactionType;
  onClose: () => void;
  onSave: (oldCategory: string | null, newCategory: string, amount: number, type: TransactionType) => void;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  isOpen,
  symbol,
  category,
  currentAmount,
  currentType,
  onClose,
  onSave
}) => {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount > 0 ? currentAmount.toString() : '');
      setName(category || '');
      // Default to variable expense if no type provided
      setType(currentType || TransactionType.EXPENSE);
    }
  }, [isOpen, category, currentAmount, currentType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!isNaN(num) && num >= 0 && name.trim()) {
      // If category was passed, we are editing (oldCategory = category). 
      // If category was empty, we are creating (oldCategory = null).
      onSave(category || null, name.trim(), num, type);
      onClose();
    }
  };

  const getTypeLabel = (t: TransactionType) => {
    switch (t) {
      case TransactionType.FIXED_EXPENSE: return 'Fixed Expense';
      case TransactionType.EXPENSE: return 'Variable Spending';
      case TransactionType.SAVING: return 'Savings';
      default: return 'Expense';
    }
  };

  const getTypeColor = (t: TransactionType) => {
    switch (t) {
      case TransactionType.FIXED_EXPENSE: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case TransactionType.EXPENSE: return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
      case TransactionType.SAVING: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{category ? 'Edit Budget' : 'New Budget'}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{category ? 'Modify Plan' : 'Create Plan'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Tag size={12} /> Category Name
            </label>
            <input
              type="text"
              required
              autoFocus={!category}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold placeholder-slate-400"
              placeholder="e.g. Ski Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Layout size={12} /> Budget Type
            </label>
            <div className="grid grid-cols-1 gap-2">
               {[TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE, TransactionType.SAVING].map(t => (
                 <button
                   key={t}
                   type="button"
                   onClick={() => setType(t)}
                   className={`px-3 py-2 rounded-lg text-xs font-bold border text-left flex items-center justify-between transition-all ${type === t ? getTypeColor(t) + ' ring-1 ring-offset-1 ring-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                 >
                   {getTypeLabel(t)}
                   {type === t && <div className="w-2 h-2 rounded-full bg-current" />}
                 </button>
               ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Hash size={12} /> Monthly Limit ({symbol})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              autoFocus={!!category}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-semibold placeholder-slate-400"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
};