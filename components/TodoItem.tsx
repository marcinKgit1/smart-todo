
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, GripVertical } from 'lucide-react';
import { Todo } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={`group flex items-center gap-4 p-4 mb-3 rounded-2xl transition-all glass-card shadow-sm hover:shadow-md ${
        todo.completed ? 'opacity-60 grayscale' : ''
      }`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          todo.completed
            ? 'bg-indigo-500 border-indigo-500 text-white'
            : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        {todo.completed && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="flex-1 flex flex-col min-w-0">
        <span
          className={`text-slate-700 font-medium truncate ${
            todo.completed ? 'line-through decoration-slate-400 decoration-2' : ''
          }`}
        >
          {todo.text}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <PriorityBadge priority={todo.priority} />
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
            {todo.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};
