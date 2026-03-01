import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              The application encountered an unexpected error.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-lg text-left mb-6 overflow-auto max-h-48">
                <p className="font-mono text-xs text-rose-600 dark:text-rose-400 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                   <p className="font-mono text-[10px] text-slate-500 mt-2 whitespace-pre-wrap">
                     {this.state.errorInfo.componentStack}
                   </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
              >
                Reload Page
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
              >
                <RefreshCw size={18} /> Clear Data & Reload
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Try reloading first. If the error persists, clear data.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
