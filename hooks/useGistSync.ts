import { useState, useEffect, useRef } from 'react';
import { BudgetItem, SavingsGoal, AppSettings, Account, Category } from '../types';

export interface SyncData {
    items: BudgetItem[];
    goals: SavingsGoal[];
    settings: AppSettings;
    accounts: Account[];
    categories: Category[];
}

interface UseGistSyncProps {
    data: SyncData;
    onImport: (data: SyncData) => void;
    autoSyncEnabled: boolean;
    gistId: string;
    token: string;
}

export const useGistSync = ({ data, onImport, autoSyncEnabled, gistId, token }: UseGistSyncProps) => {
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const isFirstRender = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load data from Gist on mount if auto-sync is enabled
    useEffect(() => {
        if (autoSyncEnabled && gistId && token && isFirstRender.current) {
            loadFromGist();
            isFirstRender.current = false;
        }
    }, [autoSyncEnabled, gistId, token]);

    // Auto-sync data when it changes
    useEffect(() => {
        if (!autoSyncEnabled || !gistId || !token || isFirstRender.current) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setSyncStatus('syncing');
        timeoutRef.current = setTimeout(() => {
            saveToGist();
        }, 2000); // Debounce for 2 seconds

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [data, autoSyncEnabled, gistId, token]);

    const loadFromGist = async () => {
        if (!gistId || !token) return;

        setSyncStatus('syncing');
        try {
            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: { Authorization: `token ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch Gist');

            const gist = await res.json();
            const file = gist.files['wealthflow_data.json'] || Object.values(gist.files)[0];

            if (!file) throw new Error('No valid data file found in Gist');

            const content: SyncData = JSON.parse((file as any).content);
            onImport(content);
            setLastSynced(new Date().toISOString());
            setSyncStatus('success');
        } catch (error: any) {
            console.error('Gist Load Error:', error);
            setSyncStatus('error');
            setErrorMessage(error.message || 'Failed to load data');
        }
    };

    const saveToGist = async () => {
        if (!gistId || !token) return;

        try {
            const contentStr = JSON.stringify(data, null, 2);
            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: { Authorization: `token ${token}` },
                body: JSON.stringify({
                    files: {
                        'wealthflow_data.json': { content: contentStr },
                    },
                }),
            });

            if (!res.ok) throw new Error('Failed to save to Gist');

            setLastSynced(new Date().toISOString());
            setSyncStatus('success');
        } catch (error: any) {
            console.error('Gist Save Error:', error);
            setSyncStatus('error');
            setErrorMessage(error.message || 'Failed to save data');
        }
    };

    return { syncStatus, lastSynced, errorMessage, loadFromGist, saveToGist };
};
