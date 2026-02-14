import React, { useState, useMemo, useEffect } from 'react';
import { Repeat, Filter, Trash2, Tag, CheckSquare, Square, X, Wallet, MoreHorizontal } from 'lucide-react';
import { BudgetItem, TransactionType, Account, Category } from '../types.ts';
import { CATEGORY_ICONS_MAP } from '../constants.ts';

interface TransactionsTableProps {
  items: BudgetItem[];
  title: string;
  symbol: string;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  className?: string;

  accounts: Account[]; // To resolve account names
  categories: Category[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  items,
  title,
  symbol,
  onEdit,
  onDelete,
  onBulkDelete,
  className,
  accounts,
  categories
}) => {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [typeFilter, categoryFilter, items.length]);

  const uniqueCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    items.forEach(item => {
      if (item.category) categoriesSet.add(item.category);
    });
    return Array.from(categoriesSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesType && matchesCategory;
    });
  }, [items, typeFilter, categoryFilter]);

  const total = filteredItems.reduce((sum, item) => sum + item.actualAmount, 0);

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    const IconComponent = cat ? CATEGORY_ICONS_MAP[cat.icon] : MoreHorizontal;
    return IconComponent ? <IconComponent size={14} /> : <MoreHorizontal size={14} />;
  };

  const getAccountName = (item: BudgetItem) => {
    const fromName = accounts.find(a => a.id === item.accountId)?.name || 'Unknown';
    if (item.type === TransactionType.TRANSFER && item.toAccountId) {
      const toName = accounts.find(a => a.id === item.toAccountId)?.name || 'Unknown';
      return `${fromName} -> ${toName}`;
    }
    return fromName;
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return 'text-emerald-600 dark:text-emerald-400';
      case TransactionType.SAVING: return 'text-indigo-600 dark:text-indigo-400';
      case TransactionType.TRANSFER: return 'text-blue-600 dark:text-blue-400';
      default: return 'text-slate-700 dark:text-slate-300';
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(item => item.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredItems.length;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors ${className}`}>
      <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${selectedIds.size > 0 ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
        {selectedIds.size > 0 ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">{selectedIds.size} selected</span>
              <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-700"></div>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                <X size={14} /> Cancel
              </button>
            </div>
            <div className="flex items-center gap-2">
              {onBulkDelete && (
                <button
                  onClick={handleBulkAction}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {filteredItems.length}
                </span>
              </div>
              <div className="flex flex-col text-right lg:hidden">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  {symbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative group flex-1 sm:flex-none sm:min-w-[140px]">
                  <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
                    className="w-full pl-8 pr-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer hover:border-indigo-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <option value="ALL">All Types</option>
                    <option value={TransactionType.INCOME}>Income</option>
                    <option value={TransactionType.EXPENSE}>Expenses</option>
                    <option value={TransactionType.FIXED_EXPENSE}>Fixed Expenses</option>
                    <option value={TransactionType.SAVING}>Savings</option>
                    <option value={TransactionType.TRANSFER}>Transfers</option>
                  </select>
                </div>

                <div className="relative group flex-1 sm:flex-none sm:min-w-[140px]">
                  <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer hover:border-indigo-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <option value="ALL">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Filtered Total</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  {symbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 transition-colors border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 w-[40px] text-center">
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isAllSelected ? (
                    <CheckSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                  ) : isIndeterminate ? (
                    <div className="relative">
                      <Square size={18} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-sm"></div>
                      </div>
                    </div>
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3 hidden sm:table-cell">Type</th>
              <th className="px-6 py-3 hidden md:table-cell">Account</th>
              <th className="px-6 py-3 hidden md:table-cell">Category</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600">
                  <div className="flex flex-col items-center gap-2">
                    <Filter size={24} className="opacity-20" />
                    <p>No transactions match your current filters.</p>
                    <button
                      onClick={() => { setTypeFilter('ALL'); setCategoryFilter('ALL'); }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const accountName = getAccountName(item);

                return (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelectRow(item.id)}
                    className={`border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer transition-colors group ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                  >
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelectRow(item.id); }}
                        className={`transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600 hover:text-indigo-400'}`}
                      >
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-xs">
                      {item.date.substring(5)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {item.recurrence && <Repeat size={12} className="text-slate-300 dark:text-slate-600" />}
                        </div>
                        <span className="text-[10px] text-slate-400 md:hidden">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700/50 transition-colors">
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 dark:text-slate-400" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                      {accountName && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Wallet size={12} className="text-slate-300 dark:text-slate-600" />
                          {accountName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 w-fit">
                        {getCategoryIcon(item.category)} {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                      <div className="flex items-center justify-end gap-3">
                        <span className={`font-semibold ${getAmountColor(item.type)}`}>
                          {item.type === TransactionType.INCOME ? '+' : ''}{symbol}{item.actualAmount.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};