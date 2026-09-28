import { useState, useEffect, useMemo } from 'react';
import { Bot, Sparkles, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { Task, FilterType, SortType } from './types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  resetDemoTasks,
} from './utils/storage';
import { calculateDashboardStatistics } from './utils/statsUtils';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TodaySpotlight } from './components/TodaySpotlight';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('due_earliest');

  // Modals & Panels
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-sync tasks to localStorage whenever tasks state updates
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Toggle complete / pending
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedStatus = !t.completed;
          showToast(
            updatedStatus
              ? `Completed "${t.title}"`
              : `Reopened "${t.title}"`
          );
          return { ...t, completed: updatedStatus };
        }
        return t;
      })
    );
  };

  // Create or Update task
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Editing existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                dueDate: taskData.dueDate,
                completed: taskData.completed,
              }
            : t
        )
      );
      showToast(`Updated "${taskData.title}"`);
    } else {
      // Adding new task
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast(`Created task "${newTask.title}"`);
    }
  };

  // Delete task
  const handleConfirmDelete = () => {
    if (!deletingTask) return;
    const taskToDelete = deletingTask;
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    showToast(`Deleted "${taskToDelete.title}"`);
    setDeletingTask(null);
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Reset all tasks to the standard TaskEase demo assignments and projects?'
      )
    ) {
      const reset = resetDemoTasks();
      setTasks(reset);
      showToast('Reset to demo tasks');
    }
  };

  // Update tasks from AI Assistant
  const handleTasksUpdateFromAi = (
    updatedTasks: Task[],
    notificationMessage?: string
  ) => {
    setTasks(updatedTasks);
    if (notificationMessage) {
      showToast(notificationMessage);
    }
  };

  // Filtered and Sorted Tasks calculation
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Filter by category
    if (activeFilter === 'pending') {
      result = result.filter((t) => !t.completed);
    } else if (activeFilter === 'completed') {
      result = result.filter((t) => t.completed);
    } else if (activeFilter === 'high') {
      result = result.filter((t) => t.priority === 'high');
    }

    // 2. Search query (case-insensitive in title and description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        return titleMatch || descMatch;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'due_earliest') {
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'due_latest') {
        return b.dueDate.localeCompare(a.dueDate);
      } else if (sortBy === 'priority_high_low') {
        const priorityOrder: Record<string, number> = {
          high: 3,
          medium: 2,
          low: 1,
        };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (sortBy === 'recently_added') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

    return result;
  }, [tasks, activeFilter, searchQuery, sortBy]);

  // Statistics calculation
  const dashboardStats = useMemo(
    () => calculateDashboardStatistics(tasks),
    [tasks]
  );

  // Counts for filter pills
  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      high: tasks.filter((t) => t.priority === 'high').length,
    }),
    [tasks]
  );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* App Header */}
      <Header
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onToggleAiAssistant={() => setIsAiDrawerOpen((prev) => !prev)}
        isAiDrawerOpen={isAiDrawerOpen}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Productivity & Overview Stats */}
        <DashboardStats
          stats={dashboardStats}
          onFilterSelect={(filter) => setActiveFilter(filter)}
        />

        {/* Section 9: Today's Tasks Spotlight */}
        <TodaySpotlight
          tasks={tasks}
          onToggleTask={handleToggleComplete}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
        />

        {/* Filters, Search, and Sort Controls */}
        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          counts={counts}
        />

        {/* Task List Header indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {activeFilter === 'all'
                ? 'All Tasks'
                : activeFilter === 'pending'
                ? 'Pending Tasks'
                : activeFilter === 'completed'
                ? 'Completed Tasks'
                : 'High Priority Tasks'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
              {filteredAndSortedTasks.length}
            </span>
          </div>

          {searchQuery && (
            <span className="text-xs text-slate-500">
              Filtered by: "<span className="font-medium text-slate-700">{searchQuery}</span>"
            </span>
          )}
        </div>

        {/* Main Task List */}
        <TaskList
          tasks={filteredAndSortedTasks}
          totalTasksCount={tasks.length}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onDelete={(task) => setDeletingTask(task)}
          onOpenNewTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        />
      </main>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      {!isAiDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsAiDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all group"
          title="Open TaskEase AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-sm font-semibold pr-1">Ask AI Assistant</span>
        </button>
      )}

      {/* Slide-over AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        tasks={tasks}
        onTasksUpdate={handleTasksUpdateFromAi}
      />

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>TaskEase</span>
            <span>•</span>
            <span className="text-slate-400">Organize Your Day</span>
          </div>
          <p className="text-slate-400">
            Task persistence in browser localStorage (`taskease_tasks_v1`)
          </p>
        </div>
      </footer>
    </div>
  );
}
