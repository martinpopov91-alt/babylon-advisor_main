import React, { useState, useEffect } from 'react';
import { Github, Save, Download, X, ExternalLink, AlertCircle, Check, Loader2, Search, RefreshCw, Calendar, GitBranch, FileJson, FolderGit2 } from 'lucide-react';
import { BudgetItem, SavingsGoal, AppSettings, Account } from '../types.ts';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    items: BudgetItem[];
    goals: SavingsGoal[];
    settings: AppSettings;
    accounts: Account[];
  };
  onImport: (data: any) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onImport
}) => {
  const [mode, setMode] = useState<'repo' | 'gist'>('repo');
  const [token, setToken] = useState('');
  
  // Repo Mode State
  const [repoName, setRepoName] = useState('martinpopov91-alt/Babylon-Advisor-');
  const [filePath, setFilePath] = useState('wealthflow_data.json');
  const [branch, setBranch] = useState('main'); // Default branch
  
  // Gist Mode State
  const [gistId, setGistId] = useState('');
  
  // Status
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [lastSyncInfo, setLastSyncInfo] = useState<{updatedAt: string, description?: string, sha?: string} | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('wealthflow_gh_token');
    const savedRepo = localStorage.getItem('wealthflow_gh_repo');
    const savedPath = localStorage.getItem('wealthflow_gh_path');
    const savedMode = localStorage.getItem('wealthflow_gh_mode');
    const savedGistId = localStorage.getItem('wealthflow_gh_gist_id');

    if (savedToken) setToken(savedToken);
    if (savedRepo) setRepoName(savedRepo);
    if (savedPath) setFilePath(savedPath);
    if (savedMode === 'repo' || savedMode === 'gist') setMode(savedMode);
    if (savedGistId) setGistId(savedGistId);

    setStatus('idle');
    setMessage('');
    setLastSyncInfo(null);
  }, [isOpen]);

  const saveConfig = () => {
    localStorage.setItem('wealthflow_gh_token', token);
    localStorage.setItem('wealthflow_gh_mode', mode);
    if (mode === 'repo') {
      localStorage.setItem('wealthflow_gh_repo', repoName);
      localStorage.setItem('wealthflow_gh_path', filePath);
    } else {
      localStorage.setItem('wealthflow_gh_gist_id', gistId);
    }
  };

  // Helper to handle UTF-8 strings in Base64
  const toBase64 = (str: string) => {
    return window.btoa(unescape(encodeURIComponent(str)));
  };

  const fromBase64 = (str: string) => {
    return decodeURIComponent(escape(window.atob(str)));
  };

  const checkConnection = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Token required');
      return;
    }
    
    saveConfig();
    setStatus('loading');
    setMessage('Checking connection...');

    try {
      if (mode === 'repo') {
        // Check Repo File
        const url = `https://api.github.com/repos/${repoName}/contents/${filePath}?ref=${branch}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (res.status === 200) {
          const data = await res.json();
          setLastSyncInfo({ updatedAt: new Date().toISOString(), sha: data.sha }); // Date is approx
          setStatus('success');
          setMessage('Repository file found!');
        } else if (res.status === 404) {
          setStatus('idle'); // Not an error, just new file
          setMessage('File not found (will be created on push).');
          setLastSyncInfo(null);
        } else {
          throw new Error(`GitHub Error: ${res.statusText}`);
        }
      } else {
        // Check Gist
        if (!gistId) {
           // Search mode
           const res = await fetch('https://api.github.com/gists', {
             headers: { 'Authorization': `token ${token}` }
           });
           if (!res.ok) throw new Error('Failed to list gists');
           const gists = await res.json();
           const filename = 'wealthflow_data.json';
           const backupGist = gists.find((g: any) => g.files[filename]);
           
           if (backupGist) {
             setGistId(backupGist.id);
             setLastSyncInfo({ updatedAt: backupGist.updated_at, description: backupGist.description });
             setStatus('success');
             setMessage('Found existing backup Gist!');
           } else {
             setStatus('idle');
             setMessage('No Gist backup found.');
           }
        } else {
           const res = await fetch(`https://api.github.com/gists/${gistId}`, {
             headers: { 'Authorization': `token ${token}` }
           });
           if (res.ok) {
             const data = await res.json();
             setLastSyncInfo({ updatedAt: data.updated_at, description: data.description });
             setStatus('success');
             setMessage('Gist connected.');
           } else {
             throw new Error('Gist not found');
           }
        }
      }
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message || 'Connection failed');
    }
  };

  const handlePush = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Token required');
      return;
    }

    setStatus('loading');
    setMessage('Pushing data...');
    saveConfig();

    const contentStr = JSON.stringify(currentData, null, 2);
    const description = `WealthFlow Data Backup (Last: ${new Date().toLocaleString()})`;

    try {
      if (mode === 'repo') {
        // 1. Get current SHA if exists
        let currentSha = lastSyncInfo?.sha;
        if (!currentSha) {
           const checkRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${filePath}?ref=${branch}`, {
             headers: { 'Authorization': `token ${token}` }
           });
           if (checkRes.ok) {
             const checkData = await checkRes.json();
             currentSha = checkData.sha;
           }
        }

        // 2. Put File
        const url = `https://api.github.com/repos/${repoName}/contents/${filePath}`;
        const res = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update ${filePath} - ${new Date().toISOString()}`,
            content: toBase64(contentStr),
            branch: branch,
            sha: currentSha // Required if updating
          })
        });

        if (!res.ok) throw new Error(`Repo Push Failed: ${res.statusText}`);
        
        const data = await res.json();
        setLastSyncInfo({ updatedAt: new Date().toISOString(), sha: data.content.sha });
        setStatus('success');
        setMessage('Successfully committed to repository!');

      } else {
        // Gist Push
        let url = 'https://api.github.com/gists';
        let method = 'POST';
        if (gistId) {
          url = `https://api.github.com/gists/${gistId}`;
          method = 'PATCH';
        }

        const res = await fetch(url, {
          method,
          headers: { 'Authorization': `token ${token}` },
          body: JSON.stringify({
            description,
            public: false,
            files: { 'wealthflow_data.json': { content: contentStr } }
          })
        });

        if (!res.ok) throw new Error(`Gist Push Failed: ${res.statusText}`);
        const data = await res.json();
        setGistId(data.id);
        localStorage.setItem('wealthflow_gh_gist_id', data.id);
        setLastSyncInfo({ updatedAt: data.updated_at, description: data.description });
        setStatus('success');
        setMessage('Saved to Gist!');
      }
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const handlePull = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Token required');
      return;
    }

    if (!confirm("This will overwrite your local data. Are you sure?")) return;

    setStatus('loading');
    setMessage('Fetching data...');
    saveConfig();

    try {
      let contentStr = '';
      
      if (mode === 'repo') {
        const url = `https://api.github.com/repos/${repoName}/contents/${filePath}?ref=${branch}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        
        if (!res.ok) throw new Error(`Repo Pull Failed: ${res.statusText}`);
        const data = await res.json();
        contentStr = fromBase64(data.content);
        setLastSyncInfo({ updatedAt: new Date().toISOString(), sha: data.sha });

      } else {
        // Gist Pull
        if (!gistId) throw new Error("Gist ID required");
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: { 'Authorization': `token ${token}` }
        });
        if (!res.ok) throw new Error(`Gist Pull Failed: ${res.statusText}`);
        const data = await res.json();
        const file = data.files['wealthflow_data.json'] || Object.values(data.files)[0];
        if (!file) throw new Error('No file found in Gist');
        contentStr = (file as any).content;
        setLastSyncInfo({ updatedAt: data.updated_at, description: data.description });
      }

      const parsed = JSON.parse(contentStr);
      onImport(parsed);
      setStatus('success');
      setMessage('Data restored successfully!');

    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Github size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">GitHub Cloud Sync</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Connect & Backup</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Token Input (Always Visible) */}
          <div>
             <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Personal Access Token (Scope: repo/gist)</label>
             <input 
               type="password" 
               className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
               placeholder="ghp_..."
               value={token}
               onChange={(e) => setToken(e.target.value)}
               onBlur={saveConfig}
             />
             <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 hover:underline w-fit">
               Create token <ExternalLink size={10} />
             </a>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button 
              onClick={() => setMode('repo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'repo' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FolderGit2 size={14} /> Repository
            </button>
            <button 
              onClick={() => setMode('gist')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'gist' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileJson size={14} /> Gist
            </button>
          </div>

          {/* Repo Config */}
          {mode === 'repo' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Repository (User/Repo)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
                    placeholder="username/my-repo"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                  />
                  <button onClick={checkConnection} className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors" title="Check Connection">
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Branch</label>
                  <div className="relative">
                    <GitBranch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">File Path</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Gist Config */}
          {mode === 'gist' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gist ID</label>
                   {token && !gistId && (
                     <button 
                       onClick={checkConnection} 
                       className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                     >
                       <Search size={10} /> Find backup
                     </button>
                   )}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
                      placeholder="Auto-generated if empty"
                      value={gistId}
                      onChange={(e) => setGistId(e.target.value)}
                    />
                    <button onClick={checkConnection} className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors" title="Check Connection">
                      <RefreshCw size={18} />
                    </button>
                 </div>
               </div>
            </div>
          )}

          {/* Feedback Area */}
          {status !== 'idle' && (
             <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
               status === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 
               status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
               'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
             }`}>
               {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
               {status === 'success' && <Check size={18} />}
               {status === 'error' && <AlertCircle size={18} />}
               <div className="flex flex-col">
                 <span className="truncate font-bold">{message}</span>
                 {lastSyncInfo && (
                   <span className="text-xs opacity-80 font-normal">Last update: {new Date(lastSyncInfo.updatedAt).toLocaleString()}</span>
                 )}
               </div>
             </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={handlePull}
              disabled={status === 'loading'}
              className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
              <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
              <span className="flex flex-col items-start leading-none">
                <span className="text-xs font-normal opacity-70">Pull Data</span>
                <span>Restore</span>
              </span>
            </button>
            <button 
              onClick={handlePush}
              disabled={status === 'loading'}
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
              <Save size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
              <span className="flex flex-col items-start leading-none">
                <span className="text-xs font-normal opacity-70">Push Data</span>
                <span>Backup</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};