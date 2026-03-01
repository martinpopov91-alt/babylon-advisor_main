import React from 'react';
import { LayoutDashboard, Landmark, CreditCard, PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface MobileNavProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
    const items = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        { id: 'accounts', icon: Landmark, label: 'Accts' },
        { id: 'transactions', icon: CreditCard, label: 'Txns' },
        { id: 'budget', icon: PieIcon, label: 'Budget' },
        { id: 'advisor', icon: TrendingUp, label: 'AI' }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-2 pb-[env(safe-area-inset-bottom,20px)] shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.1)] glass-nav">
            <div className="flex justify-around items-center h-16">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center justify-center p-2 min-w-[50px] transition-all duration-300 ${activeTab === item.id
                                ? 'text-indigo-600 dark:text-indigo-400 scale-110 -translate-y-1'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
