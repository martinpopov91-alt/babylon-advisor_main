import React, { useState } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Category, TransactionType } from '../types.ts';
import { CATEGORY_ICONS_MAP } from '../constants.ts';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ 
  isOpen, 
  onClose, 
  categories, 
  onSave, 
  onDelete 
}) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([TransactionType.EXPENSE]);
  const [subCategories, setSubCategories] = useState('');

  if (!isOpen) return null;

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setIconName(category.icon);
    setSelectedTypes(category.types);
    setSubCategories(category.subCategories ? category.subCategories.join(', ') : '');
    setView('edit');
  };

  const handleCreate = () => {
    setEditingId(null);
    setName('');
    setIconName('Tag');
    setSelectedTypes([TransactionType.EXPENSE]);
    setSubCategories('');
    setView('edit');
  };

  const toggleType = (type: TransactionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      return [...prev, type];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subs = subCategories.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const category: Category = {
      id: editingId || `custom-${Date.now()}`,
      name: name.trim(),
      icon: iconName,
      types: selectedTypes.length > 0 ? selectedTypes : [TransactionType.EXPENSE],
      subCategories: subs.length > 0 ? subs : undefined,
      isCustom: true
    };

    onSave(category);
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category? Transactions using it will keep the category name but lose the icon/association.')) {
      onDelete(id);
    }
  };

  const IconComponent = CATEGORY_ICONS_MAP[iconName] || CATEGORY_ICONS_MAP['Tag'];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
            {view === 'list' ? 'Manage Categories' : (editingId ? 'Edit Category' : 'New Category')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {view === 'list' ? (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="p-2 mb-2">
               <button 
                 onClick={handleCreate}
                 className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold flex items-center justify-center gap-2"
               >
                 <Plus size={20} /> Create New Category
               </button>
            </div>
            <div className="space-y-1">
              {categories.map(cat => {
                const CatIcon = CATEGORY_ICONS_MAP[cat.icon] || CATEGORY_ICONS_MAP['Tag'];
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <CatIcon size={18} />
                      </div>
                      <div>
                         <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{cat.name}</p>
                         <p className="text-[10px] text-slate-400">{cat.types.map(t => t.charAt(0) + t.slice(1).toLowerCase()).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(cat)} className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">Edit</button>
                       {cat.isCustom && (
                         <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 size={16} /></button>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Online Subscriptions"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Applies To</label>
              <div className="flex flex-wrap gap-2">
                {[TransactionType.EXPENSE, TransactionType.INCOME, TransactionType.FIXED_EXPENSE, TransactionType.SAVING].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedTypes.includes(type) ? 'bg-indigo-600 text-white border-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Icon</label>
              <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                {Object.keys(CATEGORY_ICONS_MAP).map(key => {
                  const Ico = CATEGORY_ICONS_MAP[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIconName(key)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${iconName === key ? 'bg-indigo-600 text-white shadow-md scale-110' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}
                      title={key}
                    >
                      <Ico size={20} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subcategories (comma separated)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={subCategories}
                onChange={e => setSubCategories(e.target.value)}
                placeholder="e.g. Netflix, Spotify, Hulu"
              />
            </div>

            <div className="flex gap-3 pt-4">
               <button type="button" onClick={() => setView('list')} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
               <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg">Save Category</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};