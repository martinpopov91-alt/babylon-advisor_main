import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Logo } from './Logo';
import { Currency, SummaryData } from '../types';

interface HeaderProps {
    activeTab: string;
    onOpenMobileMenu: () => void;
    onAddTransaction: () => void;
    currentCurrency: Currency;
    summary: SummaryData;
    spendingInsights: { daysLeft: number };
}

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    onOpenMobileMenu,
    onAddTransaction,
    currentCurrency,
    summary,
    spendingInsights
}) => {
    const title = activeTab === 'summary' ? 'Summary' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center transition-all glass-nav sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="md:hidden text-indigo-600 dark:text-indigo-400">
                    <Logo className="h-6 w-6" variant={1} />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 font-outfit truncate max-w-[180px] sm:max-w-none">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                <button
                    onClick={onOpenMobileMenu}
                    className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                    <Menu size={20} />
                </button>

                <button
                    onClick={onAddTransaction}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none text-sm hover-scale"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">Add Transaction</span>
                </button>

                <div className="text-right hidden md:block pl-6 border-l border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Left to Spend</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-outfit">
                            {currentCurrency.symbol}{summary.balance.toLocaleString()}
                        </p>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase border border-slate-200 dark:border-slate-700">
                            {spendingInsights.daysLeft}d left
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
