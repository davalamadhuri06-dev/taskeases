import React from 'react';
import { Plus, CheckCircle, SearchX } from 'lucide-react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  searchQuery: string;
  activeFilter: string;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenNewTaskModal: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTasksCount,
  searchQuery,
  activeFilter,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenNewTaskModal,
}) => {
  if (totalTasksCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <CheckCircle className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-800">
            No tasks yet
          </h3>
          <p className="text-sm text-slate-500">
            Start organizing your day! Add your first assignment, project, or daily activity.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add your first task</span>
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <SearchX className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            No matching tasks found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No tasks match "${searchQuery}". Try different keywords or clear your search.`
              : `No tasks found in the "${activeFilter}" filter.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
