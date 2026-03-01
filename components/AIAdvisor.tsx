import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Key, AlertCircle } from 'lucide-react';
import { BudgetItem, SummaryData, ChatMessage } from '../types.ts';
import { generateFinancialAdvice } from '../services/geminiService.ts';

interface AIAdvisorProps {
  data: BudgetItem[];
  summary: SummaryData;
  onKeyRequest: () => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ data, summary, onKeyRequest }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your WealthFlow AI advisor. I've analyzed your cash flow. I see you have some variable expenses and a solid savings rate. How can I help you optimize your budget today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const responseText = await generateFinancialAdvice(userMessage, data, summary);

    setIsLoading(false);
    
    if (responseText.startsWith("ACTION_REQUIRED:")) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText.replace("ACTION_REQUIRED:", "").trim() 
      }]);
    } else {
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div className="bg-indigo-600 dark:bg-indigo-900 p-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg text-white"><Sparkles size={20} /></div>
          <div>
            <h3 className="text-white font-semibold">Gemini Financial Advisor</h3>
            <p className="text-indigo-200 text-xs">Powered by Gemini 3.0 Pro Thinking</p>
          </div>
        </div>
        <button 
          onClick={onKeyRequest}
          className="p-2 text-indigo-100 hover:bg-white/10 rounded-lg transition-colors"
          title="Configure API Key"
        >
          <Key size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 transition-colors custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 dark:bg-emerald-700 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors ${msg.role === 'user' ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none prose prose-sm max-w-none dark:prose-invert'}`}>
                 {msg.text.split('\n').map((line, i) => (
                   <p key={i} className="mb-1 last:mb-0 min-h-[1.2em]">
                     {line.includes("API key") || line.includes("ACTION_REQUIRED") ? (
                       <span className="flex items-start gap-2 text-rose-500 dark:text-rose-400 font-medium">
                         <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                         {line}
                       </span>
                     ) : line}
                   </p>
                 ))}
                 
                 {msg.text.includes("select a project") && (
                   <button 
                     onClick={onKeyRequest}
                     className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                   >
                     <Key size={14} /> Open Key Selection
                   </button>
                 )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-center flex-shrink-0"><Bot size={16} /></div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 transition-colors">
                <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-500 dark:text-slate-400 text-sm italic">Thinking deeply...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-inner">
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 py-1" 
            placeholder="Ask..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            className={`p-2 rounded-full transition-all active:scale-90 ${isLoading || !input.trim() ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-2 font-medium tracking-wide uppercase">AI Advisor powered by Gemini.</p>
      </div>
    </div>
  );
};