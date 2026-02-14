import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Account, AccountType } from '../types.ts';
import { ACCOUNT_ICONS } from '../constants.ts';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
  initialData?: Account | null;
  symbol: string;
}

const COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
  '#14B8A6', // Teal
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSave, initialData, symbol }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.CHECKING);
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setInitialBalance(initialData.initialBalance.toString());
        setColor(initialData.color);
      } else {
        setName('');
        setType(AccountType.CHECKING);
        setInitialBalance('');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      type,
      initialBalance: parseFloat(initialBalance) || 0,
      currency: 'EUR', // Should ideally come from app settings, but fixed for now or needs props
      color
    });
    onClose();
  };

  const AccountIcon = ACCOUNT_ICONS[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
               {AccountIcon && <AccountIcon size={20} />}
             </div>
             <div>
               <h3 className="font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Edit Account' : 'New Account'}</h3>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Manage your sources</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Account Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Main Checking, Amex Gold"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-sm font-medium"
              >
                {Object.keys(ACCOUNT_ICONS).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Initial Balance ({symbol})</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Color Code</label>
             <div className="flex flex-wrap gap-3">
               {COLORS.map(c => (
                 <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                 >
                   {color === c && <Check size={14} className="text-white" />}
                 </button>
               ))}
             </div>
          </div>

          <div className="pt-2 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
               Cancel
             </button>
             <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
               {initialData ? 'Update Account' : 'Create Account'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};