import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Repeat, Filter, Trash2, Tag, CheckSquare, Square, Download, Edit3, Wand2, MoreHorizontal } from 'lucide-react';
import { BudgetItem, TransactionType, Account, Category } from '../types';
import { CATEGORY_ICONS_MAP } from '../constants';
import { parseBankCSV, autoCategorizeTransactions } from '../utils/csvImporter';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface TransactionsTableProps {
  items: BudgetItem[];
  title: string;
  symbol: string;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  className?: string;
  accounts: Account[];
  categories: Category[];
  onAddMultipleTransactions?: (items: BudgetItem[]) => void;
  hasApiKey?: boolean;
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
  categories,
  onAddMultipleTransactions,
  hasApiKey
}) => {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- IMPORT LOGIC ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewItems, setPreviewItems] = useState<BudgetItem[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const newItems = parseBankCSV(text, accounts[0]?.id || "default", file.name);

      if (newItems && newItems.length > 0) {
        setPreviewItems(newItems);
      } else {
        alert("No valid transactions found or file format is incorrect.");
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!previewItems || !onAddMultipleTransactions) return;

    const apiKey = localStorage.getItem('wealthflow_ai_key');
    if (apiKey && previewItems.length > 0) {
      setIsImporting(true);
      try {
        const catNames = categories.map(c => c.name);
        const categorized = await autoCategorizeTransactions(previewItems, catNames, apiKey);
        onAddMultipleTransactions(categorized);
      } catch (err) {
        console.error("AI categorization failed", err);
        onAddMultipleTransactions(previewItems);
      } finally {
        setIsImporting(false);
      }
    } else {
      onAddMultipleTransactions(previewItems);
    }
    setPreviewItems(null);
  };
  // --------------------

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

  // Grouping by date logic
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: { date: string, items: BudgetItem[], total: number } } = {};

    filteredItems.forEach(item => {
      const date = item.date;
      if (!groups[date]) {
        groups[date] = { date, items: [], total: 0 };
      }
      groups[date].items.push(item);

      if (item.type === TransactionType.INCOME) {
        groups[date].total += item.actualAmount;
      } else if (item.type !== TransactionType.TRANSFER) {
        groups[date].total -= item.actualAmount;
      }
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredItems]);

  const total = filteredItems.reduce((sum, item) => {
    if (item.type === TransactionType.INCOME) return sum + item.actualAmount;
    if (item.type === TransactionType.TRANSFER) return sum;
    return sum - item.actualAmount;
  }, 0);

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    const IconComponent = cat ? CATEGORY_ICONS_MAP[cat.icon as keyof typeof CATEGORY_ICONS_MAP] : MoreHorizontal;
    return IconComponent ? <IconComponent size={14} /> : <MoreHorizontal size={14} />;
  };

  const getAccountInfo = (item: BudgetItem) => {
    const account = accounts.find(a => a.id === item.accountId);
    if (item.type === TransactionType.TRANSFER && item.toAccountId) {
      const toAccount = accounts.find(a => a.id === item.toAccountId);
      return {
        name: `${account?.name || 'Unknown'} → ${toAccount?.name || 'Unknown'}`,
        color: account?.color || '#CBD5E1'
      };
    }
    return {
      name: account?.name || 'Unknown',
      color: account?.color || '#CBD5E1'
    };
  };

  const getAmountColor = (item: BudgetItem) => {
    switch (item.type) {
      case TransactionType.INCOME: return 'text-emerald-600 dark:text-emerald-400';
      case TransactionType.SAVING: return 'text-indigo-600 dark:text-indigo-400';
      case TransactionType.TRANSFER: return 'text-blue-600 dark:text-blue-400';
      default: return 'text-rose-600 dark:text-rose-400';
    }
  };

  const getTimeFromId = (id: string) => {
    if (id.startsWith('man-')) {
      const timestamp = parseInt(id.split('-')[1]);
      if (!isNaN(timestamp)) {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    return '';
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    const weekNum = getWeekNumber(d);
    return `${dateFormatted} (Week ${weekNum})`;
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

  const isAllSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;

  return (
    <div className={`flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 ${className}`}>
      <div className="px-6 py-4 bg-white dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Found {filteredItems.length} records
            </h3>
            {selectedIds.size > 0 && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider animate-in fade-in slide-in-from-left-2">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
              {isAllSelected ? <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} />}
              Select all
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 text-[11px] font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-900/40"
          >
            <Download size={13} className="rotate-180" /> Import CSV
          </button>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Edit3 size={13} /> Edit
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Download size={13} /> Export
              </button>
              <button
                onClick={() => onBulkDelete?.(Array.from(selectedIds))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-100 transition-colors border border-rose-100 dark:border-rose-900/40"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-300">
              {total < 0 ? '-' : ''}{symbol}{Math.abs(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-2 bg-slate-50 group-hover:bg-slate-100 dark:bg-slate-900/30 flex items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="pl-7 pr-3 py-1 text-[11px] font-bold bg-transparent border-none focus:ring-0 text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              <option value="ALL">All Types</option>
              {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="relative">
            <Tag size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-7 pr-3 py-1 text-[11px] font-bold bg-transparent border-none focus:ring-0 text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {groupedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900/20">
            <Wand2 size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-medium">No transactions found for this period</p>
          </div>
        ) : (
          groupedItems.map((group) => (
            <div key={group.date} className="flex flex-col">
              <div className="sticky top-0 z-10 px-6 py-2.5 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {formatDate(group.date)}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {group.total < 0 ? '-' : ''}{symbol}{Math.abs(group.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-slate-900/40">
                {group.items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const accountInfo = getAccountInfo(item);
                  const time = getTimeFromId(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('.action-button')) return;
                        toggleSelectRow(item.id);
                      }}
                      className={`group flex items-center px-6 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 flex items-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelectRow(item.id); }}
                            className={`transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-200 dark:text-slate-700 group-hover:text-slate-400'}`}
                          >
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                        </div>

                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/20 dark:border-slate-700/20">
                          {getCategoryIcon(item.category)}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.category}
                            </h4>
                            {item.recurrence && <Repeat size={10} className="text-slate-400" />}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accountInfo.color }}></span>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                                {accountInfo.name}
                              </span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate italic">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-bold ${getAmountColor(item)}`}>
                            {item.type === TransactionType.INCOME ? '+' : item.type === TransactionType.TRANSFER ? '' : '-'}{symbol}{item.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-tight">
                          {time}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                          className="action-button p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                          className="action-button p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import Preview Modal */}
      {previewItems && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Review Import</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We found {previewItems.length} transactions in your file.</p>
              </div>
              <button
                onClick={() => setPreviewItems(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <AlertCircle size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {previewItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                      <Tag size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className={`text-sm font-bold ${getAmountColor(item)}`}>
                      {item.type === TransactionType.INCOME ? '+' : '-'}{symbol}{item.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setPreviewItems(null)}
                className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="flex-1 max-w-[240px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    AI Categorizing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirm Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};