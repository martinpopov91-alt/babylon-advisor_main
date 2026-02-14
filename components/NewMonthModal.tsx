import React, { useState, useEffect } from 'react';
import { X, Calendar, Copy, Sparkles, ArrowRight } from 'lucide-react';

interface NewMonthModalProps {
  isOpen: boolean;
  currentStartDate: string;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string, mode: 'rollover' | 'blank') => void;
}

export const NewMonthModal: React.FC<NewMonthModalProps> = ({
  isOpen,
  currentStartDate,
  onClose,
  onConfirm
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mode, setMode] = useState<'rollover' | 'blank'>('blank');

  useEffect(() => {
    if (isOpen) {
      // Safely parse without timezone shifts using local components
      const dateStr = currentStartDate || new Date().toISOString().split('T')[0];
      const [y, m, d] = dateStr.split('-');
      
      // Create date object for the *current* period start
      const currentStart = new Date(Number(y), Number(m) - 1, Number(d) || 1);
      
      // Calculate NEXT month's start (1st day) and end (Last day)
      const nextStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1);
      const nextEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 2, 0);

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setStartDate(formatLocalDate(nextStart));
      setEndDate(formatLocalDate(nextEnd));
      setMode('blank'); // Default to blank start
    }
  }, [isOpen, currentStartDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      if (startDate > endDate) {
        alert("Start date must be before end date.");
        return;
      }
      onConfirm(startDate, endDate, mode);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Start New Period</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Setup your next budget</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Start Date</label>
              <input 
                type="date" 
                required 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">End Date</label>
              <input 
                type="date" 
                required 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Setup Mode</p>
            
            <label className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${mode === 'blank' ? 'bg-indigo-50 border-indigo-500/30 dark:bg-indigo-900/20 dark:border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'}`}>
              <div className="flex items-center justify-center mt-0.5">
                <input 
                  type="radio" 
                  name="new_month_mode"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" 
                  checked={mode === 'blank'}
                  onChange={() => setMode('blank')}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className={mode === 'blank' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                  <p className={`text-sm font-bold ${mode === 'blank' ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Fresh Start</p>
                </div>
                <p className={`text-xs leading-relaxed ${mode === 'blank' ? 'text-indigo-700/80 dark:text-indigo-300/70' : 'text-slate-500 dark:text-slate-400'}`}>
                  Begin with a completely empty budget. Great for resetting your habits. <span className="font-semibold">Does not affect past history.</span>
                </p>
              </div>
            </label>

            <label className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${mode === 'rollover' ? 'bg-indigo-50 border-indigo-500/30 dark:bg-indigo-900/20 dark:border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'}`}>
              <div className="flex items-center justify-center mt-0.5">
                <input 
                  type="radio" 
                  name="new_month_mode"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" 
                  checked={mode === 'rollover'}
                  onChange={() => setMode('rollover')}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Copy size={16} className={mode === 'rollover' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                  <p className={`text-sm font-bold ${mode === 'rollover' ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Roll Over Plan</p>
                </div>
                <p className={`text-xs leading-relaxed ${mode === 'rollover' ? 'text-indigo-700/80 dark:text-indigo-300/70' : 'text-slate-500 dark:text-slate-400'}`}>
                  Copy your budget limits and recurring items from the current period. Actual spending is reset to zero.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
              Start Period <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};