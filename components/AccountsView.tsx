import React, { useMemo } from 'react';
import { Plus, MoreVertical, Trash2, Pencil, Wallet } from 'lucide-react';
import { Account, BudgetItem, TransactionType } from '../types.ts';
import { ACCOUNT_ICONS } from '../constants.ts';

interface AccountsViewProps {
  accounts: Account[];
  items: BudgetItem[]; // Needed to calculate balances
  symbol: string;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ 
  accounts, 
  items, 
  symbol, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount 
}) => {
  
  const calculateBalance = (account: Account) => {
    // 1. Start with initial
    let balance = account.initialBalance;

    // 2. Add/Subtract based on transactions linked to this account
    // Note: We scan ALL items, not just filtered ones, to get true balance. 
    // However, in this app 'items' is usually the state from App.tsx which contains all transactions.
    // If 'items' passed here is filtered by date, the balance might be wrong. 
    // Ideally, App.tsx should pass allItems. Assuming 'items' here refers to the master list or we accept it's a "Period Balance" if filtered.
    // For a proper account view, typically you want ALL transactions. 
    // Let's assume for now 'items' contains all history (since App.tsx loads all from localstorage).
    
    items.forEach(item => {
      if (item.accountId === account.id) {
        if (item.type === TransactionType.INCOME) {
          balance += item.actualAmount;
        } else {
          balance -= item.actualAmount;
        }
      }
    });

    return balance;
  };

  const accountCards = useMemo(() => {
    return accounts.map(account => ({
      ...account,
      currentBalance: calculateBalance(account)
    }));
  }, [accounts, items]);

  const totalNetWorth = accountCards.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      
      {/* Net Worth Header */}
      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-slate-900/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Total Net Worth</p>
            <h2 className="text-4xl font-bold">{symbol}{totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 font-medium">Across {accounts.length} accounts</p>
          </div>
          <button 
            onClick={onAddAccount}
            className="flex items-center gap-2 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 dark:hover:bg-slate-900/20 px-5 py-3 rounded-xl font-bold transition-all backdrop-blur-sm"
          >
            <Plus size={20} /> Add Account
          </button>
        </div>
      </div>

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accountCards.map(account => {
          const Icon = ACCOUNT_ICONS[account.type] || Wallet;
          const isNegative = account.currentBalance < 0;

          return (
            <div key={account.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button 
                   onClick={() => onEditAccount(account)}
                   className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                 >
                   <Pencil size={16} />
                 </button>
                 {!account.isDefault && (
                    <button 
                      onClick={() => onDeleteAccount(account.id)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                 )}
              </div>

              <div className="flex items-start justify-between mb-8">
                <div className="p-3 rounded-xl text-white shadow-lg" style={{ backgroundColor: account.color }}>
                  <Icon size={24} />
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{account.type.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{account.name}</h3>
                <p className={`text-2xl font-bold font-mono ${isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {symbol}{account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Decorative stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-50" style={{ backgroundColor: account.color }}></div>
            </div>
          );
        })}

        {/* Add New Placeholder */}
        <button 
          onClick={onAddAccount}
          className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 dark:hover:border-indigo-900/50 transition-all min-h-[200px] gap-3"
        >
          <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold">Add New Account</span>
        </button>
      </div>
    </div>
  );
};