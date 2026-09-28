import { Task } from '../types/task';

export const STORAGE_KEY = 'taskease_tasks_v1';

export const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Web Technology Project Report',
    description: 'Document the architecture, features, and screenshots of TaskEase for submission.',
    priority: 'high',
    dueDate: '2026-09-28',
    completed: false,
    createdAt: '2026-09-27T07:22:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Review Operating Systems Lecture Notes',
    description: 'Study CPU scheduling algorithms and memory management paging mechanisms.',
    priority: 'medium',
    dueDate: '2026-09-28',
    completed: true,
    createdAt: '2026-09-26T07:22:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Prepare Presentation Slides for Seminar',
    description: 'Design 10 clean slides focusing on problem statement, solution, and demo.',
    priority: 'high',
    dueDate: '2026-09-29',
    completed: false,
    createdAt: '2026-09-27T19:22:00.000Z',
  },
  {
    id: 'task-4',
    title: 'Return Library Books & Issue References',
    description: 'Algorithms textbook and Distributed Systems handbook.',
    priority: 'low',
    dueDate: '2026-10-01',
    completed: false,
    createdAt: '2026-09-28T07:22:00.000Z',
  },
];

export function loadTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTasksToStorage(INITIAL_DEMO_TASKS);
      return INITIAL_DEMO_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_TASKS;
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return INITIAL_DEMO_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function resetDemoTasks(): Task[] {
  saveTasksToStorage(INITIAL_DEMO_TASKS);
  return INITIAL_DEMO_TASKS;
}
