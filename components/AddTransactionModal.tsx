import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, Repeat, Info, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { TransactionType, BudgetItem, RecurrenceFrequency, Account, Category } from '../types.ts';

interface AddTransactionModalProps {
  isOpen: boolean;
  symbol: string;
  onClose: () => void;
  onSave: (item: Omit<BudgetItem, 'id'>) => void;
  initialData?: BudgetItem | null;
  defaultCategory?: string;
  defaultType?: TransactionType;
  onDelete?: () => void;
  accounts: Account[];
  categories: Category[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  symbol,
  onClose, 
  onSave, 
  initialData,
  defaultCategory,
  defaultType,
  onDelete,
  accounts,
  categories
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [actualAmount, setActualAmount] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDate(initialData.date);
        setActualAmount(initialData.actualAmount.toString());
        setPlannedAmount(initialData.plannedAmount.toString());
        setType(initialData.type);
        setCategory(initialData.category);
        setSubCategory(initialData.subCategory || '');
        setIsRecurring(!!initialData.recurrence);
        setFrequency(initialData.recurrence?.frequency || 'MONTHLY');
        setAccountId(initialData.accountId || (accounts[0]?.id || ''));
      } else {
        setName('');
        setDate(new Date().toISOString().split('T')[0]);
        setActualAmount('');
        setPlannedAmount('');
        setType(defaultType || TransactionType.EXPENSE);
        setCategory(defaultCategory || '');
        setSubCategory('');
        setIsRecurring(false);
        setFrequency('MONTHLY');
        setAccountId(accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '');
      }
    }
  }, [isOpen, initialData, defaultCategory, defaultType, accounts]);

  const selectedCategoryDef = useMemo(() => 
    categories.find(c => c.name === category), 
  [category, categories]);

  const filteredCategories = useMemo(() => 
    categories.filter(c => c.types.includes(type) || c.name === 'Other'),
  [type, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nextDate = new Date(date);
    if (frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
    else if (frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (frequency === 'YEARLY') nextDate.setFullYear(nextDate.getFullYear() + 1);

    onSave({ 
      name, 
      date, 
      actualAmount: parseFloat(actualAmount) || 0, 
      plannedAmount: parseFloat(plannedAmount) || 0, 
      type, 
      category, 
      subCategory: subCategory || undefined,
      recurrence: isRecurring ? {
        frequency,
        nextDate: nextDate.toISOString().split('T')[0]
      } : undefined,
      accountId: accountId || undefined
    });
    onClose();
  };

  const getTypeColor = (t: TransactionType) => {
    switch (t) {
      case TransactionType.INCOME: return 'bg-emerald-500 text-white';
      case TransactionType.SAVING: return 'bg-indigo-500 text-white';
      case TransactionType.FIXED_EXPENSE: return 'bg-amber-500 text-white';
      default: return 'bg-rose-500 text-white';
    }
  };

  const getAmountLabels = (t: TransactionType) => {
    switch (t) {
      case TransactionType.INCOME:
        return { actual: 'Amount Received', planned: 'Expected Amount' };
      case TransactionType.SAVING:
        return { actual: 'Amount Saved', planned: 'Goal/Planned' };
      case TransactionType.FIXED_EXPENSE:
      case TransactionType.EXPENSE:
      default:
        return { actual: 'Amount Spent', planned: 'Planned Budget' };
    }
  };

  const labels = getAmountLabels(type);
  const isOverBudget = type !== TransactionType.INCOME && parseFloat(actualAmount) > parseFloat(plannedAmount) && parseFloat(plannedAmount) > 0;
  const isUnderIncome = type === TransactionType.INCOME && parseFloat(actualAmount) < parseFloat(plannedAmount) && parseFloat(plannedAmount) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200 transition-colors my-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
              <Plus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                {initialData ? 'Edit' : 'New'} Transaction
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Transaction Type Picker */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE, TransactionType.INCOME, TransactionType.SAVING].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory(''); // Clear category when type changes
                  }}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                    type === t 
                      ? `${getTypeColor(t)} border-transparent shadow-md` 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                <input 
                  type="date" 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Monthly Rent, Grocery Store..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm placeholder-slate-400" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{labels.actual} ({symbol})</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                    value={actualAmount} 
                    onChange={e => setActualAmount(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{labels.planned} ({symbol})</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                    value={plannedAmount} 
                    onChange={e => setPlannedAmount(e.target.value)} 
                  />
                </div>
              </div>
              
              {isOverBudget && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                  <AlertCircle size={14} />
                  <span>Warning: This exceeds your planned budget.</span>
                </div>
              )}
              {isUnderIncome && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-medium border border-amber-100 dark:border-amber-900/30">
                  <AlertCircle size={14} />
                  <span>Note: Received less than expected income.</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Account Selection */}
              <div>
                 <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Account</label>
                 <div className="relative">
                   <select
                     value={accountId}
                     onChange={(e) => setAccountId(e.target.value)}
                     className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                   >
                     {accounts.map(acc => (
                       <option key={acc.id} value={acc.id}>{acc.name}</option>
                     ))}
                     {accounts.length === 0 && <option value="">No accounts found</option>}
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                 </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                <div className="relative">
                  <select
                    required
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory('');
                    }}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                  >
                    <option value="" disabled>Select a category</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Sub-Category Tag Cloud */}
              {selectedCategoryDef?.subCategories && selectedCategoryDef.subCategories.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Sub-category</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryDef.subCategories.map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubCategory(sub === subCategory ? '' : sub)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          subCategory === sub 
                            ? 'bg-indigo-600 border-transparent text-white shadow-sm' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recurrence Settings */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Repeat size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as recurring</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isRecurring ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {isRecurring && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {(['WEEKLY', 'MONTHLY', 'YEARLY'] as RecurrenceFrequency[]).map(freq => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setFrequency(freq)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            frequency === freq 
                              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs">
            <Info size={16} className="flex-shrink-0" />
            <p>WealthFlow will automatically update your actual amounts for items with the same description and category.</p>
          </div>

          <div className="pt-2 flex gap-3">
             {initialData && onDelete && (
                <button 
                  type="button" 
                  onClick={onDelete}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
             )}
            <button 
              type="submit" 
              className={`flex-1 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] ${getTypeColor(type)}`}
            >
              {initialData ? 'Update Transaction' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};