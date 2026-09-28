import React from 'react';
import {
  Check,
  Calendar,
  AlertTriangle,
  Pencil,
  Trash2,
  Flame,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { Task } from '../types/task';
import { formatDateToDisplay, getRelativeDueDateLabel } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const relativeDate = getRelativeDueDateLabel(task.dueDate);
  const formattedDate = formatDateToDisplay(task.dueDate);

  // Priority Visual Configuration (Section 4)
  const priorityConfig = {
    high: {
      label: 'High Priority',
      colorBadge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dotColor: 'bg-rose-500',
      icon: Flame,
      borderAccent: 'border-l-rose-500',
      description: 'Urgent & Important (Exams, Submissions)',
    },
    medium: {
      label: 'Medium Priority',
      colorBadge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dotColor: 'bg-amber-500',
      icon: Briefcase,
      borderAccent: 'border-l-amber-500',
      description: 'Normal Important Work (Coursework, Assignments)',
    },
    low: {
      label: 'Low Priority',
      colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotColor: 'bg-emerald-500',
      icon: BookOpen,
      borderAccent: 'border-l-emerald-500',
      description: 'Less Urgent (Reading, General Activities)',
    },
  }[task.priority];

  const PriorityIcon = priorityConfig.icon;

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 border-l-[5px] ${
        task.completed
          ? 'border-l-slate-300 opacity-75 bg-slate-50/50'
          : priorityConfig.borderAccent
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            task.completed
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'border-2 border-slate-300 hover:border-indigo-600 hover:bg-indigo-50/50'
          }`}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Priority & Due Date Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityConfig.colorBadge}`}
              title={priorityConfig.description}
            >
              <PriorityIcon className="w-3 h-3" />
              <span>{priorityConfig.label}</span>
            </span>

            {/* Due Date Chip */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                relativeDate.isOverdue && !task.completed
                  ? 'bg-red-50 text-red-700 border-red-200 font-semibold animate-pulse'
                  : relativeDate.isToday
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                  : relativeDate.isTomorrow
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={`Due: ${formattedDate}`}
            >
              {relativeDate.isOverdue && !task.completed ? (
                <AlertTriangle className="w-3 h-3 text-red-600" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              <span>{relativeDate.label}</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ({formattedDate})
              </span>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onEdit(task)}
            className={`text-base font-semibold tracking-tight cursor-pointer transition-colors ${
              task.completed
                ? 'line-through text-slate-400 decoration-slate-300'
                : 'text-slate-900 hover:text-indigo-600'
            }`}
          >
            {task.title}
          </h3>

          {/* Optional Description */}
          {task.description && (
            <p
              className={`mt-1 text-sm leading-relaxed ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Created date note */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(task)}
                title="Edit task"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(task)}
                title="Delete task"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
