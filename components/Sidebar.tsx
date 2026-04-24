import React from 'react';
import {
    LayoutDashboard,
    Landmark,
    BarChart3,
    CreditCard,
    PieChart as PieIcon,
    Target,
    TrendingUp,
    Key,
    Tag,
    RefreshCw,
    Github,
    Sun,
    Moon,
    Save,
    Download,
    Upload
} from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    hasApiKey: boolean;
    onOpenKeySelection: () => void;
    onOpenCategoryManager: () => void;
    autoSyncEnabled: boolean;
    syncStatus: string;
    onOpenGitHubModal: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onManualSave: () => void;
    onOpenNewMonthModal: () => void;
    onBackup: () => void;
    onRestoreClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    hasApiKey,
    onOpenKeySelection,
    onOpenCategoryManager,
    autoSyncEnabled,
    syncStatus,
    onOpenGitHubModal,
    isDarkMode,
    onToggleTheme,
    onManualSave,
    onOpenNewMonthModal,
    onBackup,
    onRestoreClick
}) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'accounts', label: 'Accounts', icon: Landmark },
        { id: 'summary', label: 'Monthly Summary', icon: BarChart3 },
        { id: 'transactions', label: 'Transactions', icon: CreditCard },
        { id: 'budget', label: 'Budget Plan', icon: PieIcon },
        { id: 'goals', label: 'Savings Goals', icon: Target },
        { id: 'advisor', label: 'AI Advisor', icon: TrendingUp },
    ];

    return (
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 hidden md:flex flex-col glass-card !rounded-none !border-y-0 !border-l-0">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-500">
                    <Logo className="h-8 w-8 text-indigo-500" variant={1} />
                    <span className="text-xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white">Babylon Advisor</span>
                </div>
            </div>

            <nav className="p-4 space-y-1 flex-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium hover-scale ${activeTab === item.id
                            // PERFECT BLUE THEME ACTIVE TAB: Blue background with crisp WHITE text
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 dark:shadow-none font-bold'
                            // PERFECT LIGHT/DARK INACTIVE TABS: Navy text in light mode, grey in dark mode
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <item.icon size={20} /> {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-4">
                {!hasApiKey && (
                    <button
                        onClick={onOpenKeySelection}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-800/50 transition-all hover:bg-amber-100 dark:hover:bg-amber-800/40"
                    >
                        <Key size={16} /> Enable AI Features
                    </button>
                )}

                <button
                    onClick={onOpenCategoryManager}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover-scale"
                >
                    <Tag size={16} /> Manage Categories
                </button>

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onOpenGitHubModal}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative group"
                            title="Cloud Sync"
                        >
                            <Github size={20} />
                            {syncStatus === 'error' && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>}
                        </button>
                        <button
                            onClick={onToggleTheme}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    {autoSyncEnabled && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-[10px] font-bold">
                            {syncStatus === 'syncing' ? (
                                <RefreshCw size={12} className="animate-spin text-indigo-500" />
                            ) : (
                                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-emerald-500' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                            )}
                            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-tight">Sync</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2">
                    <SidebarActionBtn icon={Save} label="Save" onClick={onManualSave} />
                    <SidebarActionBtn icon={RefreshCw} label="Period" onClick={onOpenNewMonthModal} />
                    <SidebarActionBtn icon={Download} label="Backup" onClick={onBackup} />
                    <SidebarActionBtn icon={Upload} label="Restore" onClick={onRestoreClick} />
                </div>
            </div>
        </aside>
    );
};

const SidebarActionBtn = ({ icon: Icon, label, onClick }: any) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 transition-all hover-scale hover:text-indigo-600 dark:hover:text-indigo-400"
    >
        <Icon size={18} className="mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
);