export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string; // ISO timestamp
}

export type FilterType = 'all' | 'pending' | 'completed' | 'high';

export type SortType =
  | 'due_earliest'
  | 'due_latest'
  | 'priority_high_low'
  | 'recently_added';

export interface DashboardStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
  completionPercentage: number;
  productivityMessage: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    actionPrompt: string;
  }>;
  disambiguationTasks?: Task[];
  matchedTasks?: Task[];
  executedAction?: {
    type: 'add' | 'complete' | 'reopen' | 'edit' | 'delete' | 'filter' | 'stats';
    taskTitle?: string;
  };
}
