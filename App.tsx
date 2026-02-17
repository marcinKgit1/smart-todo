
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, CheckCircle2, ListTodo, CircleDashed, Loader2 } from 'lucide-react';
import { Todo, Priority, FilterType, SuggestionResponse } from './types.ts';
import { TodoItem } from './components/TodoItem.tsx';
import { getSmartSuggestions } from './services/geminiService.ts';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('smart-flow-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse['suggestions']>([]);

  useEffect(() => {
    localStorage.setItem('smart-flow-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, priority: Priority = 'medium', category: string = 'General') => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo(inputValue);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const getSuggestions = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    const context = todos.length > 0 
      ? `Currently working on: ${todos.slice(0, 5).map(t => t.text).join(', ')}`
      : "No tasks yet, suggest some general productivity goals.";
    
    try {
      const result = await getSmartSuggestions(context);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Suggestions failed:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (activeFilter === 'active') return !todo.completed;
      if (activeFilter === 'completed') return todo.completed;
      return true;
    });
  }, [todos, activeFilter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, active, progress };
  }, [todos]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">SmartFlow</h1>
              <p className="text-slate-500 mt-1 font-medium">Keep your tasks in motion.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{stats.progress}%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Complete</div>
            </div>
          </motion.div>

          <div className="mt-6 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 1 }}
            />
          </div>
        </header>

        {/* Input Area */}
        <section className="mb-8">
          <div className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What needs to be done?"
              className="w-full pl-12 pr-14 py-4 rounded-2xl glass-card shadow-lg shadow-indigo-100 outline-none border-0 ring-2 ring-transparent focus:ring-indigo-500/20 transition-all text-lg placeholder:text-slate-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Plus size={24} />
            </div>
            <button
              onClick={() => addTodo(inputValue)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </section>

        {/* AI Suggestions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <Sparkles size={16} className="text-indigo-500" />
              Smart Suggestions
            </h2>
            <button
              onClick={getSuggestions}
              disabled={isSuggesting}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-all disabled:opacity-50"
            >
              {isSuggesting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {isSuggesting ? 'Thinking...' : 'Get AI Ideas'}
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {suggestions.map((s, idx) => (
                <motion.button
                  key={`sug-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    addTodo(s.text, s.priority, s.category);
                    setSuggestions(prev => prev.filter((_, i) => i !== idx));
                  }}
                  className="whitespace-nowrap flex-shrink-0 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    {s.text}
                    <Plus size={14} className="text-slate-300 group-hover:text-indigo-400" />
                  </span>
                </motion.button>
              ))}
              {suggestions.length === 0 && !isSuggesting && (
                <div className="text-slate-400 text-xs italic py-2">Kliknij "Get AI Ideas" dla sugestii...</div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl">
            {(['all', 'active', 'completed'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === filter
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
               <CircleDashed size={14} className="text-indigo-400" />
               {stats.active} Aktywne
             </div>
             <div className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
               <CheckCircle2 size={14} className="text-emerald-400" />
               {stats.completed} Gotowe
             </div>
          </div>
        </section>

        {/* Todo List */}
        <section className="relative">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-300 mb-4">
                  <ListTodo size={40} />
                </div>
                <h3 className="text-slate-400 font-medium">Brak zadań do wyświetlenia...</h3>
                <p className="text-slate-300 text-sm mt-1">Dodaj zadanie lub użyj AI dla pomysłów!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default App;
