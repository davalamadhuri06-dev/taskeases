import React, { useState, useEffect } from 'react';
import { X, Calendar, Flame, Briefcase, BookOpen } from 'lucide-react';
import { Task, Priority } from '../types/task';
import { getTodayDateString, parseRelativeDate } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate);
      setCompleted(initialTask.completed);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(getTodayDateString());
      setCompleted(false);
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || getTodayDateString(),
      completed,
    });
    onClose();
  };

  const setPresetDate = (presetText: string) => {
    const calculated = parseRelativeDate(presetText);
    setDueDate(calculated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="text-lg font-bold text-slate-900">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Complete Java Assignment"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, guidelines, or submission requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 resize-none transition-all"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* High */}
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  priority === 'high'
                    ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-400/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flame className={`w-4 h-4 mb-1 ${priority === 'high' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>High</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">Urgent</span>
              </button>

              {/* Medium */}
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-50 border-amber-400 text-amber-700 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className={`w-4 h-4 mb-1 ${priority === 'medium' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Medium</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">Normal</span>
              </button>

              {/* Low */}
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  priority === 'low'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-400/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className={`w-4 h-4 mb-1 ${priority === 'low' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Low</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">Flexible</span>
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-due-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date (YYYY-MM-DD)
            </label>
            <div className="relative">
              <input
                id="task-due-date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Quick date presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-medium py-0.5 mr-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Quick set:
              </span>
              <button
                type="button"
                onClick={() => setPresetDate('today')}
                className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setPresetDate('tomorrow')}
                className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setPresetDate('in 3 days')}
                className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetDate('next week')}
                className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Initial task status toggle if editing */}
          {initialTask && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Status</span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-600">
                  {completed ? 'Marked Completed' : 'Pending'}
                </span>
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
