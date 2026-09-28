import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task } from '../types/task';
import { formatDateToDisplay, getTodayDateString } from '../utils/dateUtils';

interface TodaySpotlightProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const TodaySpotlight: React.FC<TodaySpotlightProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const todayStr = getTodayDateString();
  const formattedToday = formatDateToDisplay(todayStr);

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const pendingToday = todayTasks.filter((t) => !t.completed);
  const completedToday = todayTasks.filter((t) => t.completed);

  if (todayTasks.length === 0) {
    return null;
  }

  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden transition-all">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-indigo-50/60 via-white to-slate-50 border-b border-indigo-100/70 hover:bg-indigo-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Today's Focus
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {formattedToday} • {pendingToday.length} pending, {completedToday.length} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            {isExpanded ? 'Hide' : 'Show'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pending Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Pending ({pendingToday.length})</span>
              </div>
            </div>

            {pendingToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                All of today's tasks are completed! ✨
              </p>
            ) : (
              <div className="space-y-2">
                {pendingToday.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all group"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 hover:border-indigo-600 flex items-center justify-center transition-colors shrink-0"
                    >
                      <span className="sr-only">Complete task</span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadgeClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <h4
                          onClick={() => onEditTask(task)}
                          className="text-sm font-semibold text-slate-800 truncate cursor-pointer hover:text-indigo-600"
                        >
                          {task.title}
                        </h4>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Completed ({completedToday.length})</span>
              </div>
            </div>

            {completedToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No tasks completed yet today.
              </p>
            ) : (
              <div className="space-y-2">
                {completedToday.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 transition-all group"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-slate-500 line-through truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
