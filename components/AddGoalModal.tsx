import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Target, Trash2, Calendar, Hash } from 'lucide-react';
import { SavingsGoal, TransactionType, Category } from '../types.ts';

interface AddGoalModalProps {
  isOpen: boolean;
  symbol: string;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id'>) => void;
  initialData?: SavingsGoal | null;
  onDelete?: () => void;
  categories: Category[];
}

const COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#64748B', // Slate
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, symbol, onClose, onSave, initialData, onDelete, categories }) => {
  const [name, setName] = useState('');
  const [hasTarget, setHasTarget] = useState(true);
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setHasTarget(initialData.targetAmount > 0);
        setTargetAmount(initialData.targetAmount > 0 ? initialData.targetAmount.toString() : '');
        setInitialAmount(initialData.initialAmount.toString());
        setHasDeadline(!!initialData.deadline);
        setDeadline(initialData.deadline || '');
        setCategory(initialData.category);
        setSubCategory(initialData.subCategory || '');
        setColor(initialData.color);
      } else {
        setName('');
        setHasTarget(true);
        setTargetAmount('');
        setInitialAmount('0');
        setHasDeadline(false);
        setDeadline('');
        setCategory('');
        setSubCategory('');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    if (hasTarget && !targetAmount) return; // If target is enabled, it must be filled

    onSave({
      name,
      targetAmount: hasTarget ? parseFloat(targetAmount) : 0,
      initialAmount: parseFloat(initialAmount) || 0,
      deadline: hasDeadline ? deadline : undefined,
      category,
      subCategory: subCategory || undefined,
      color
    });
    onClose();
  };

  const savingsCategories = categories.filter(c => c.types.includes(TransactionType.SAVING));
  const selectedCategoryDef = categories.find(c => c.name === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Target size={20} className="text-indigo-600 dark:text-indigo-400"/>
            {initialData ? 'Edit Savings Goal' : 'New Savings Goal'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Goal Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400"
              placeholder="e.g. Dream House, Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Target Amount Toggle & Input */}
            <div className={`p-4 rounded-xl border transition-all ${hasTarget ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasTarget} 
                    onChange={(e) => setHasTarget(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  Set Target Amount
                </label>
                <Hash size={14} className="text-slate-400" />
              </div>
              
              {hasTarget && (
                <div className="animate-in slide-in-from-top-1 duration-200">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    placeholder={`10000 ${symbol}`}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Deadline Toggle & Input */}
            <div className={`p-4 rounded-xl border transition-all ${hasDeadline ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasDeadline} 
                    onChange={(e) => setHasDeadline(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  Set Target Date
                </label>
                <Calendar size={14} className="text-slate-400" />
              </div>
              
              {hasDeadline && (
                <div className="animate-in slide-in-from-top-1 duration-200">
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Starting Balance ({symbol})</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              placeholder="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Link to Category</label>
            <div className="relative mb-2">
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory('');
                }}
              >
                <option value="">Select Category</option>
                {savingsCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            {selectedCategoryDef?.subCategories && selectedCategoryDef.subCategories.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Subcategory</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryDef.subCategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubCategory(sub === subCategory ? '' : sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Color Tag</label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {initialData ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};