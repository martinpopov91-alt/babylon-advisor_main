import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { BudgetItem, TransactionType } from '../types';

interface MonthlyPlanViewProps {
    items: BudgetItem[];
    symbol: string;
}

export const MonthlyPlanView: React.FC<MonthlyPlanViewProps> = ({ items, symbol }) => {
    // We store the "Planned" amounts in state (later you can save this to Firebase/LocalStorage)
    const [planned, setPlanned] = useState<Record<string, number>>({
        'Заплата': 3093.66,
        'Ваучери за храна': 100,
        'Кредити ипотечен ДСК': 984.70,
        'Застраховка ДСК': 91.43,
        'Гориво': 200,
        'Електричество': 50,
        'Savings': 309.37,
        'Vault - Vacations': 78
    });

    const handleUpdatePlanned = (category: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPlanned(prev => ({ ...prev, [category]: numValue }));
    };

    // Automatically calculate "Actual" spent from your transactions!
    const calculateActual = (category: string, type: TransactionType) => {
        return items
            .filter(item => item.category === category && item.type === type)
            .reduce((sum, item) => sum + item.actualAmount, 0);
    };

    // Create the layout structure based on Sheet2
    const sections = [
        {
            title: 'Income (Приходи)',
            icon: <TrendingUp size={18} className="text-emerald-500" />,
            type: TransactionType.INCOME,
            categories: ['Заплата', 'Ваучери за храна', 'Преден месец']
        },
        {
            title: 'Fixed Bills (Сметки)',
            icon: <TrendingDown size={18} className="text-rose-500" />,
            type: TransactionType.EXPENSE,
            categories: ['Кредити ипотечен ДСК', 'Застраховка ДСК', 'MetLife', 'Десятък 10%']
        },
        {
            title: 'Variable Costs (Променливи)',
            icon: <Target size={18} className="text-amber-500" />,
            type: TransactionType.EXPENSE,
            categories: ['Гориво', 'Електричество', 'Вода', 'Храна']
        },
        {
            title: 'Savings (Спестявания)',
            icon: <PiggyBank size={18} className="text-indigo-500" />,
            type: TransactionType.SAVING,
            categories: ['Savings', 'Vault - Vacations', 'Vault - Investment']
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Top Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Income Planned</p>
                    <h3 className="text-2xl font-bold text-emerald-600">
                        {symbol} {Object.entries(planned).filter(([k]) => sections[0].categories.includes(k)).reduce((a, [_, v]) => a + v, 0).toFixed(2)}
                    </h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Expenses Planned</p>
                    <h3 className="text-2xl font-bold text-rose-600">
                        {symbol} {Object.entries(planned).filter(([k]) => sections[1].categories.includes(k) || sections[2].categories.includes(k)).reduce((a, [_, v]) => a + v, 0).toFixed(2)}
                    </h3>
                </div>
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-md text-white">
                    <p className="text-sm font-bold text-indigo-100 mb-1">Left to Budget (Остатък)</p>
                    <h3 className="text-2xl font-bold">
                        {symbol} 805.18 {/* You can make this dynamic later! */}
                    </h3>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sections.map(section => (
                    <div key={section.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                            {section.icon}
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{section.title}</h3>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                                <div className="col-span-6">Category</div>
                                <div className="col-span-3 text-right">Planned</div>
                                <div className="col-span-3 text-right">Actual</div>
                            </div>

                            {section.categories.map(cat => {
                                const actual = calculateActual(cat, section.type);
                                const currentPlanned = planned[cat] || 0;
                                const progress = currentPlanned > 0 ? Math.min((actual / currentPlanned) * 100, 100) : 0;

                                return (
                                    <div key={cat} className="group relative">
                                        <div className="grid grid-cols-12 gap-4 items-center px-2 py-1">
                                            <div className="col-span-6 font-medium text-sm text-slate-700 dark:text-slate-300 truncate">
                                                {cat}
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    value={planned[cat] || ''}
                                                    onChange={(e) => handleUpdatePlanned(cat, e.target.value)}
                                                    placeholder="0"
                                                    className="w-full text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="col-span-3 text-right font-bold text-sm text-slate-900 dark:text-white">
                                                {actual.toFixed(2)}
                                            </div>
                                        </div>
                                        {/* Progress Bar under the row */}
                                        {section.type !== TransactionType.INCOME && (
                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${progress > 90 ? 'bg-rose-500' : progress > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};