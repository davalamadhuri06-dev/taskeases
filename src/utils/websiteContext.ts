import { Task } from '../types/task';
import { calculateDashboardStatistics } from './statsUtils';
import { formatDateToDisplay, getTodayDateString } from './dateUtils';

export interface WebsiteChartData {
  summary: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    completionPercentage: number;
    overdueCount: number;
    dueTodayCount: number;
    upcomingCount: number;
  };
  priorityBreakdown: {
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
  };
  statusBreakdown: {
    completed: { count: number; percentage: number };
    pending: { count: number; percentage: number };
  };
  scheduleBreakdown: {
    overdue: { count: number; percentage: number };
    dueToday: { count: number; percentage: number };
    upcoming: { count: number; percentage: number };
  };
}

export interface WebsiteContextData {
  application: {
    name: string;
    description: string;
    platform: string;
    version: string;
    currentDate: string;
    formattedToday: string;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    highPriorityTasks: number;
    completionPercentage: number;
    productivityMessage: string;
  };
  charts: WebsiteChartData;
  taskBreakdown: {
    pending: Array<{
      id: string;
      title: string;
      description?: string;
      priority: string;
      dueDate: string;
      formattedDueDate: string;
      isOverdue: boolean;
      isDueToday: boolean;
    }>;
    completed: Array<{
      id: string;
      title: string;
      description?: string;
      priority: string;
      dueDate: string;
      formattedDueDate: string;
    }>;
  };
  supportedActions: {
    queries: string[];
    taskManagementCapabilities: string[];
  };
}

/**
 * Calculates percentage safe helper
 */
function toPercent(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Helper to render an ASCII visual progress / bar chart
 */
export function renderAsciiBar(value: number, max: number, barLength: number = 20): string {
  if (max <= 0) return '░'.repeat(barLength) + ' 0%';
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const filled = Math.round(ratio * barLength);
  const empty = barLength - filled;
  const pct = Math.round(ratio * 100);
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${pct}%`;
}

/**
 * Compiles exhaustive structured data snapshot of the TaskEase website and current workspace.
 */
export function buildComprehensiveWebsiteContext(tasks: Task[]): WebsiteContextData {
  const todayStr = getTodayDateString();
  const stats = calculateDashboardStatistics(tasks);

  const pending = tasks
    .filter((t) => !t.completed)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      dueDate: t.dueDate,
      formattedDueDate: formatDateToDisplay(t.dueDate),
      isOverdue: t.dueDate < todayStr,
      isDueToday: t.dueDate === todayStr,
    }));

  const completed = tasks
    .filter((t) => t.completed)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      dueDate: t.dueDate,
      formattedDueDate: formatDateToDisplay(t.dueDate),
    }));

  const overdueCount = pending.filter((t) => t.isOverdue).length;
  const dueTodayCount = pending.filter((t) => t.isDueToday).length;
  const upcomingCount = pending.filter((t) => !t.isOverdue && !t.isDueToday).length;

  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const medCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;
  const total = tasks.length;

  const charts: WebsiteChartData = {
    summary: {
      total,
      completed: stats.completedTasks,
      pending: stats.pendingTasks,
      highPriority: stats.highPriorityTasks,
      completionPercentage: stats.completionPercentage,
      overdueCount,
      dueTodayCount,
      upcomingCount,
    },
    priorityBreakdown: {
      high: { count: highCount, percentage: toPercent(highCount, total) },
      medium: { count: medCount, percentage: toPercent(medCount, total) },
      low: { count: lowCount, percentage: toPercent(lowCount, total) },
    },
    statusBreakdown: {
      completed: { count: stats.completedTasks, percentage: toPercent(stats.completedTasks, total) },
      pending: { count: stats.pendingTasks, percentage: toPercent(stats.pendingTasks, total) },
    },
    scheduleBreakdown: {
      overdue: { count: overdueCount, percentage: toPercent(overdueCount, stats.pendingTasks) },
      dueToday: { count: dueTodayCount, percentage: toPercent(dueTodayCount, stats.pendingTasks) },
      upcoming: { count: upcomingCount, percentage: toPercent(upcomingCount, stats.pendingTasks) },
    },
  };

  return {
    application: {
      name: 'TaskEase',
      description: 'Clean, modern Task Management Dashboard with Natural Language AI Assistance',
      platform: 'React + TypeScript + Vite + Tailwind CSS SPA',
      version: '1.0.0',
      currentDate: todayStr,
      formattedToday: formatDateToDisplay(todayStr),
    },
    metrics: {
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      pendingTasks: stats.pendingTasks,
      highPriorityTasks: stats.highPriorityTasks,
      completionPercentage: stats.completionPercentage,
      productivityMessage: stats.productivityMessage,
    },
    charts,
    taskBreakdown: {
      pending,
      completed,
    },
    supportedActions: {
      queries: [
        'Review and analyze all my current website and task data in charts',
        'What do I need to do today?',
        'What tasks are overdue or pending?',
        'Show high priority tasks',
        'How is my progress / what are my statistics?',
        'Recommend which task to focus on first',
      ],
      taskManagementCapabilities: [
        'Add task with title, priority (low, medium, high), and due date',
        'Mark task as complete / incomplete',
        'Edit task title, priority, due date, description',
        'Delete task',
        'Filter tasks by All, Pending, Completed, High Priority, Due Today, Overdue',
      ],
    },
  };
}

/**
 * Builds a comprehensive text prompt containing ASCII charts, tables, and structured data
 * to ensure ANY AI agent receives formatted chart and report representations directly in its message input.
 */
export function buildContextualizedPrompt(userQuery: string, tasks: Task[]): string {
  const context = buildComprehensiveWebsiteContext(tasks);
  const todayStr = context.application.currentDate;
  const stats = context.metrics;
  const charts = context.charts;
  const pendingList = context.taskBreakdown.pending;
  const completedList = context.taskBreakdown.completed;

  // Chart 1: Status Distribution Bar
  const completedBar = renderAsciiBar(stats.completedTasks, stats.totalTasks, 16);
  const pendingBar = renderAsciiBar(stats.pendingTasks, stats.totalTasks, 16);

  // Chart 2: Priority Distribution Bar
  const highBar = renderAsciiBar(charts.priorityBreakdown.high.count, stats.totalTasks, 16);
  const medBar = renderAsciiBar(charts.priorityBreakdown.medium.count, stats.totalTasks, 16);
  const lowBar = renderAsciiBar(charts.priorityBreakdown.low.count, stats.totalTasks, 16);

  // Chart 3: Schedule Breakdown Bar (Pending)
  const overdueBar = renderAsciiBar(charts.scheduleBreakdown.overdue.count, Math.max(stats.pendingTasks, 1), 16);
  const todayBar = renderAsciiBar(charts.scheduleBreakdown.dueToday.count, Math.max(stats.pendingTasks, 1), 16);
  const upcomingBar = renderAsciiBar(charts.scheduleBreakdown.upcoming.count, Math.max(stats.pendingTasks, 1), 16);

  // Formatted pending table chart
  const pendingRows =
    pendingList.length > 0
      ? pendingList
          .map((t, idx) => {
            const statusBadge = t.isOverdue ? '[OVERDUE ⚠️]' : t.isDueToday ? '[DUE TODAY 🔔]' : '[UPCOMING]';
            return `| #${idx + 1} | ${t.title.padEnd(28)} | ${t.priority.toUpperCase().padEnd(6)} | ${t.dueDate} | ${statusBadge} |`;
          })
          .join('\n')
      : '| - | (All tasks are currently completed) | - | - | - |';

  // Formatted completed table chart
  const completedRows =
    completedList.length > 0
      ? completedList
          .map((t, idx) => `| #${idx + 1} | ${t.title.padEnd(28)} | ${t.priority.toUpperCase().padEnd(6)} | ${t.dueDate} | [COMPLETED ✅] |`)
          .join('\n')
      : '| - | (No completed tasks recorded yet) | - | - | - |';

  return `[LIVE TASKEASE WEBSITE DATA & CHARTS REPORT]
Application: ${context.application.name} (${context.application.description})
Platform: ${context.application.platform}
System Date: ${context.application.formattedToday} (${todayStr})

============================================================
📊 CHART 1: TASK COMPLETION STATUS & OVERVIEW
============================================================
• Total Tasks Recorded: ${stats.totalTasks}
• Completed Tasks:     ${stats.completedTasks} (${stats.completionPercentage}%)
• Pending Tasks:       ${stats.pendingTasks} (${100 - stats.completionPercentage}%)
• Productivity Status: "${stats.productivityMessage}"

Status Visual Chart:
  Completed : ${completedBar} (${stats.completedTasks}/${stats.totalTasks})
  Pending   : ${pendingBar} (${stats.pendingTasks}/${stats.totalTasks})

============================================================
📈 CHART 2: PRIORITY DISTRIBUTION
============================================================
  High Priority   : ${highBar} (${charts.priorityBreakdown.high.count} tasks)
  Medium Priority : ${medBar} (${charts.priorityBreakdown.medium.count} tasks)
  Low Priority    : ${lowBar} (${charts.priorityBreakdown.low.count} tasks)

============================================================
📅 CHART 3: SCHEDULE & DEADLINE DISTRIBUTION (PENDING)
============================================================
  ⚠️ Overdue     : ${overdueBar} (${charts.scheduleBreakdown.overdue.count} tasks)
  🔔 Due Today   : ${todayBar} (${charts.scheduleBreakdown.dueToday.count} tasks)
  ⏳ Upcoming    : ${upcomingBar} (${charts.scheduleBreakdown.upcoming.count} tasks)

============================================================
📋 TABLE CHART: DETAILED PENDING TASKS (${pendingList.length} ITEMS)
============================================================
| No. | Task Title                   | Pri.   | Due Date   | Schedule Status  |
|-----|------------------------------|--------|------------|------------------|
${pendingRows}

============================================================
✅ TABLE CHART: COMPLETED TASKS (${completedList.length} ITEMS)
============================================================
| No. | Task Title                   | Pri.   | Due Date   | Schedule Status  |
|-----|------------------------------|--------|------------|------------------|
${completedRows}

[USER QUESTION / REQUEST]
${userQuery}`;
}
