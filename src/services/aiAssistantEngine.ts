import { Task, Priority } from '../types/task';
import {
  formatDateToDisplay,
  getTodayDateString,
  parseRelativeDate,
} from '../utils/dateUtils';
import { calculateDashboardStatistics } from '../utils/statsUtils';

export interface AgentExecutionResult {
  replyText: string;
  updatedTasks?: Task[];
  executedAction?: {
    type: 'add' | 'complete' | 'reopen' | 'edit' | 'delete' | 'filter' | 'stats';
    taskTitle?: string;
  };
  disambiguationTasks?: Task[];
  matchedTasks?: Task[];
  suggestedActions?: Array<{
    label: string;
    actionPrompt: string;
  }>;
}

/**
 * Format a single task strictly according to Section 14
 * Task: [title]
 * Priority: [priority]
 * Due: [date]
 * Status: [Pending/Completed]
 */
export function formatSingleTask(task: Task): string {
  const priorityCapitalized =
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  const formattedDate = formatDateToDisplay(task.dueDate);
  const statusStr = task.completed ? 'Completed' : 'Pending';

  return `Task: ${task.title}\nPriority: ${priorityCapitalized}\nDue: ${formattedDate}\nStatus: ${statusStr}`;
}

/**
 * Format multiple tasks as a simple numbered list according to Section 14
 */
export function formatTaskList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  return tasks
    .map((task, index) => {
      const formatted = formatSingleTask(task);
      return `${index + 1}. ${formatted}`;
    })
    .join('\n\n');
}

/**
 * Find tasks matching a query string across title and description (case-insensitive)
 */
export function findMatchingTasks(tasks: Task[], query: string): Task[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Exact title match first
  const exact = tasks.filter((t) => t.title.toLowerCase() === cleanQuery);
  if (exact.length > 0) return exact;

  // Substring match in title
  const titleSub = tasks.filter((t) => t.title.toLowerCase().includes(cleanQuery));
  if (titleSub.length > 0) return titleSub;

  // Word token matching in title
  const queryTokens = cleanQuery
    .split(/\s+/)
    .filter((w) => !['the', 'my', 'task', 'a', 'an', 'to', 'for', 'please'].includes(w));

  if (queryTokens.length > 0) {
    const tokenMatches = tasks.filter((t) => {
      const titleLower = t.title.toLowerCase();
      return queryTokens.every((tok) => titleLower.includes(tok));
    });
    if (tokenMatches.length > 0) return tokenMatches;

    // Any token match
    const anyTokenMatches = tasks.filter((t) => {
      const titleLower = t.title.toLowerCase();
      const descLower = t.description.toLowerCase();
      return queryTokens.some((tok) => titleLower.includes(tok) || descLower.includes(tok));
    });
    if (anyTokenMatches.length > 0) return anyTokenMatches;
  }

  // Fallback to description match
  return tasks.filter((t) => t.description.toLowerCase().includes(cleanQuery));
}

/**
 * Main NLU Engine processing user requests against current task state
 */
export function processUserRequest(
  userInput: string,
  currentTasks: Task[]
): AgentExecutionResult {
  const text = userInput.trim();
  const lower = text.toLowerCase();
  const todayStr = getTodayDateString();

  // 0. EXHAUSTIVE WEBSITE DATA INQUIRY (All website & app data)
  if (
    lower.includes('all data') ||
    lower.includes('all the data') ||
    lower.includes('website data') ||
    lower.includes('app data') ||
    lower.includes('site data') ||
    lower.includes('export data') ||
    lower.includes('full report') ||
    lower.includes('everything about my website')
  ) {
    const stats = calculateDashboardStatistics(currentTasks);
    const pendingList = currentTasks.filter((t) => !t.completed);
    const completedList = currentTasks.filter((t) => t.completed);
    const highPriorityList = currentTasks.filter((t) => t.priority === 'high' && !t.completed);

    const reply =
      `🌐 **TaskEase Complete Website & Workspace Overview**\n\n` +
      `**Platform Details:**\n` +
      `• Application: **TaskEase** (Smart Task & Productivity Dashboard)\n` +
      `• Architecture: React + TypeScript + Vite + Tailwind CSS\n` +
      `• Active AI Engine: Natural Language Task Assistant + n8n Cloud Webhook\n` +
      `• Local System Date: ${formatDateToDisplay(todayStr)} (${todayStr})\n\n` +
      `📊 **Live Workspace Metrics:**\n` +
      `• Total Tasks in Database: ${stats.totalTasks}\n` +
      `• Pending Tasks: ${stats.pendingTasks}\n` +
      `• Completed Tasks: ${stats.completedTasks}\n` +
      `• Completion Rate: ${stats.completionPercentage}%\n` +
      `• High Priority Active: ${highPriorityList.length}\n` +
      `• Status: ${stats.productivityMessage}\n\n` +
      `📌 **Pending Tasks Breakdown (${pendingList.length}):**\n` +
      (pendingList.length > 0
        ? pendingList
            .map(
              (t, i) =>
                `${i + 1}. **${t.title}** [${t.priority.toUpperCase()}] — Due: ${formatDateToDisplay(
                  t.dueDate
                )}${t.dueDate < todayStr ? ' ⚠️ *(Overdue)*' : t.dueDate === todayStr ? ' 🔔 *(Due Today)*' : ''}`
            )
            .join('\n')
        : '*(No pending tasks! All caught up)*') +
      `\n\n` +
      `✅ **Completed Tasks History (${completedList.length}):**\n` +
      (completedList.length > 0
        ? completedList
            .map((t, i) => `${i + 1}. ~~${t.title}~~ (${formatDateToDisplay(t.dueDate)})`)
            .join('\n')
        : '*(No completed tasks yet)*') +
      `\n\n` +
      `🛠️ **Supported Agent Controls:**\n` +
      `• "Add [title] [priority] [due date]"\n` +
      `• "Complete [task name]"\n` +
      `• "Delete [task name]"\n` +
      `• "What do I need to do today?"\n` +
      `• "Show high priority tasks"`;

    return {
      replyText: reply,
      executedAction: { type: 'stats' },
      suggestedActions: [
        { label: "What do I need to do today?", actionPrompt: "What do I need to do today?" },
        { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
        { label: "What's pending?", actionPrompt: "What's pending?" },
      ],
    };
  }

  // 1. STATS / PRODUCTIVITY INQUIRIES
  if (
    lower.includes('stat') ||
    lower.includes('progress') ||
    lower.includes('productivity') ||
    lower.includes('how am i doing') ||
    lower.includes('completion percentage') ||
    lower.includes('summary')
  ) {
    const stats = calculateDashboardStatistics(currentTasks);
    const reply =
      `Here is your current TaskEase summary:\n\n` +
      `• Total Tasks: ${stats.totalTasks}\n` +
      `• Completed Tasks: ${stats.completedTasks}\n` +
      `• Pending Tasks: ${stats.pendingTasks}\n` +
      `• High Priority Tasks: ${stats.highPriorityTasks}\n` +
      `• Completion: ${stats.completionPercentage}%\n\n` +
      `${stats.productivityMessage}`;

    return {
      replyText: reply,
      executedAction: { type: 'stats' },
      suggestedActions: [
        { label: "Show today's tasks", actionPrompt: "What do I need to do today?" },
        { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
      ],
    };
  }

  // 2. TODAY'S TASKS (Section 9)
  // "What do I need to do today?", "Show today's tasks", "Today's work"
  if (
    lower.includes("today's task") ||
    lower.includes('tasks for today') ||
    lower.includes('due today') ||
    lower.includes('need to do today') ||
    lower === 'today' ||
    lower === "what's today?" ||
    lower.includes('what do i need to do today')
  ) {
    const todayTasks = currentTasks.filter((t) => t.dueDate === todayStr);
    const pendingToday = todayTasks.filter((t) => !t.completed);
    const completedToday = todayTasks.filter((t) => t.completed);

    if (todayTasks.length === 0) {
      return {
        replyText: `You have no tasks scheduled for today (${formatDateToDisplay(todayStr)}).\n\nEnjoy your day or add a task!`,
        matchedTasks: [],
        suggestedActions: [
          { label: "Show all pending", actionPrompt: "Show pending tasks" },
          { label: "Add task for today", actionPrompt: "Add a task due today" },
        ],
      };
    }

    let reply = `Here are your tasks for today (${formatDateToDisplay(todayStr)}):\n\n`;

    if (pendingToday.length > 0) {
      reply += `📌 Pending (${pendingToday.length}):\n${formatTaskList(pendingToday)}\n\n`;
    } else {
      reply += `📌 Pending (0): All caught up for today!\n\n`;
    }

    if (completedToday.length > 0) {
      reply += `✅ Completed (${completedToday.length}):\n${formatTaskList(completedToday)}`;
    }

    return {
      replyText: reply.trim(),
      matchedTasks: todayTasks,
      suggestedActions: pendingToday.length > 0
        ? [
            {
              label: `Complete "${pendingToday[0].title.slice(0, 20)}..."`,
              actionPrompt: `Complete ${pendingToday[0].title}`,
            },
          ]
        : undefined,
    };
  }

  // 3. TOMORROW'S TASKS
  if (lower.includes('tomorrow')) {
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const tomorrow = new Date(tY, tM - 1, tD);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    // If user is asking to view tomorrow's tasks
    if (
      lower.includes('show') ||
      lower.includes('what') ||
      lower.includes('list') ||
      lower.includes('view') ||
      !lower.startsWith('add')
    ) {
      const tomorrowTasks = currentTasks.filter((t) => t.dueDate === tomorrowStr);
      if (tomorrowTasks.length === 0) {
        return {
          replyText: `You have no tasks scheduled for tomorrow (${formatDateToDisplay(tomorrowStr)}).`,
          suggestedActions: [
            { label: "Show today's tasks", actionPrompt: "Show today's tasks" },
            { label: "Add a task for tomorrow", actionPrompt: "Add task due tomorrow" },
          ],
        };
      }
      return {
        replyText: `Tasks scheduled for tomorrow (${formatDateToDisplay(tomorrowStr)}):\n\n${formatTaskList(tomorrowTasks)}`,
        matchedTasks: tomorrowTasks,
      };
    }
  }

  // 4. VIEW / FILTER REQUESTS
  // Pending tasks
  if (
    lower.includes("what's pending") ||
    lower.includes('what is pending') ||
    lower.includes('show pending') ||
    lower.includes('pending tasks') ||
    lower.includes('unfinished tasks') ||
    lower.includes('what do i have left')
  ) {
    const pending = currentTasks.filter((t) => !t.completed);
    if (pending.length === 0) {
      return {
        replyText: `🎉 You have no pending tasks! Everything is completed!`,
        matchedTasks: [],
      };
    }
    return {
      replyText: `Here are your pending tasks (${pending.length}):\n\n${formatTaskList(pending)}`,
      matchedTasks: pending,
      executedAction: { type: 'filter' },
      suggestedActions: [
        { label: "Show today's tasks", actionPrompt: "Show today's tasks" },
        { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
      ],
    };
  }

  // Completed tasks
  if (
    lower.includes('show completed') ||
    lower.includes('completed tasks') ||
    lower.includes('what did i finish') ||
    lower.includes('show completed work') ||
    lower.includes('finished tasks')
  ) {
    const completed = currentTasks.filter((t) => t.completed);
    if (completed.length === 0) {
      return {
        replyText: `You haven't completed any tasks yet. Check off a pending task to get started!`,
        matchedTasks: [],
      };
    }
    return {
      replyText: `Here are your completed tasks (${completed.length}):\n\n${formatTaskList(completed)}`,
      matchedTasks: completed,
      executedAction: { type: 'filter' },
    };
  }

  // High priority / Urgent tasks
  if (
    lower.includes('urgent') ||
    lower.includes('high priority') ||
    lower.includes('important tasks')
  ) {
    // If not adding a task
    if (!lower.startsWith('add') && !lower.startsWith('create')) {
      const highPriority = currentTasks.filter((t) => t.priority === 'high');
      if (highPriority.length === 0) {
        return {
          replyText: `You currently have no high-priority tasks.`,
          matchedTasks: [],
        };
      }
      return {
        replyText: `Here are your high-priority tasks (${highPriority.length}):\n\n${formatTaskList(highPriority)}`,
        matchedTasks: highPriority,
        executedAction: { type: 'filter' },
      };
    }
  }

  // Generic "Show my tasks" / "List all tasks"
  if (
    lower === 'show my tasks' ||
    lower === 'show all tasks' ||
    lower === 'list tasks' ||
    lower === 'view tasks' ||
    lower === 'tasks' ||
    lower === 'all tasks'
  ) {
    if (currentTasks.length === 0) {
      return {
        replyText: 'You currently have no tasks in TaskEase. Add your first task to get started!',
      };
    }
    return {
      replyText: `Here are all your tasks (${currentTasks.length}):\n\n${formatTaskList(currentTasks)}`,
      matchedTasks: currentTasks,
      executedAction: { type: 'filter' },
    };
  }

  // Search tasks: "Find my Java tasks", "Search report", "Look for..."
  const searchMatch = lower.match(/(?:find|search|look for)\s+(?:my\s+)?(.+)/i);
  if (searchMatch && !lower.startsWith('complete') && !lower.startsWith('delete')) {
    const searchTerm = searchMatch[1].replace(/tasks?$/i, '').trim();
    if (searchTerm) {
      const results = currentTasks.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || descMatch;
      });

      if (results.length === 0) {
        return {
          replyText: `No tasks found matching "${searchTerm}".`,
        };
      }
      return {
        replyText: `Found ${results.length} task(s) matching "${searchTerm}":\n\n${formatTaskList(results)}`,
        matchedTasks: results,
      };
    }
  }

  // 5. COMPLETE TASK ACTION (Section 8, 13, 15)
  // "Finish my Java task", "Mark Java assignment done", "Complete Web Technology Project Report", "Done with seminar"
  const isCompleteIntent =
    lower.startsWith('complete ') ||
    lower.startsWith('finish ') ||
    lower.startsWith('done with ') ||
    lower.includes('mark as done') ||
    lower.includes('mark done') ||
    lower.includes('marked as done') ||
    lower.includes('mark completed');

  if (isCompleteIntent) {
    // Extract target task query
    let target = text
      .replace(/^complete\s+/i, '')
      .replace(/^finish\s+/i, '')
      .replace(/^done with\s+/i, '')
      .replace(/^mark\s+/i, '')
      .replace(/\s+as\s+done$/i, '')
      .replace(/\s+done$/i, '')
      .replace(/\s+as\s+completed$/i, '')
      .replace(/\s+completed$/i, '')
      .replace(/^my\s+/i, '')
      .replace(/\s+task$/i, '')
      .trim();

    if (!target) {
      return {
        replyText: 'Which task would you like to mark as completed? Please provide the task name.',
      };
    }

    const matches = findMatchingTasks(currentTasks, target);

    if (matches.length === 0) {
      return {
        replyText: `I couldn't find any task matching "${target}". Here are your pending tasks:\n\n${formatTaskList(currentTasks.filter((t) => !t.completed))}`,
      };
    }

    if (matches.length === 1) {
      const matched = matches[0];
      const updated = currentTasks.map((t) =>
        t.id === matched.id ? { ...t, completed: true } : t
      );
      const updatedTask = { ...matched, completed: true };

      return {
        replyText:
          `Great job! I've marked the task as completed:\n\n` +
          `${formatSingleTask(updatedTask)}`,
        updatedTasks: updated,
        executedAction: { type: 'complete', taskTitle: matched.title },
        suggestedActions: [
          { label: "Show remaining pending tasks", actionPrompt: "What's pending?" },
          { label: "Check my progress", actionPrompt: "What are my stats?" },
        ],
      };
    }

    // Multiple matches - Section 13: ask user to disambiguate!
    return {
      replyText: `I found ${matches.length} tasks that match "${target}". Which one would you like to complete?`,
      disambiguationTasks: matches,
      suggestedActions: matches.map((t) => ({
        label: `Complete "${t.title.slice(0, 25)}"`,
        actionPrompt: `Complete ${t.title}`,
      })),
    };
  }

  // 6. REOPEN TASK ACTION (Section 8)
  // "Reopen project report", "Mark Java assignment as pending", "Undo finish"
  const isReopenIntent =
    lower.startsWith('reopen ') ||
    lower.includes('mark as pending') ||
    lower.includes('mark as unfinished') ||
    lower.includes('undo complete');

  if (isReopenIntent) {
    let target = text
      .replace(/^reopen\s+/i, '')
      .replace(/^mark\s+/i, '')
      .replace(/\s+as\s+pending$/i, '')
      .replace(/\s+as\s+unfinished$/i, '')
      .replace(/^undo\s+complete\s+/i, '')
      .replace(/^my\s+/i, '')
      .replace(/\s+task$/i, '')
      .trim();

    if (!target) {
      return {
        replyText: 'Which task would you like to reopen? Please provide the task name.',
      };
    }

    const matches = findMatchingTasks(currentTasks, target);

    if (matches.length === 0) {
      return {
        replyText: `I couldn't find any task matching "${target}".`,
      };
    }

    if (matches.length === 1) {
      const matched = matches[0];
      const updated = currentTasks.map((t) =>
        t.id === matched.id ? { ...t, completed: false } : t
      );
      const updatedTask = { ...matched, completed: false };

      return {
        replyText:
          `I've reopened the task:\n\n` +
          `${formatSingleTask(updatedTask)}`,
        updatedTasks: updated,
        executedAction: { type: 'reopen', taskTitle: matched.title },
      };
    }

    return {
      replyText: `Multiple tasks match "${target}". Which one do you want to reopen?`,
      disambiguationTasks: matches,
      suggestedActions: matches.map((t) => ({
        label: `Reopen "${t.title.slice(0, 25)}"`,
        actionPrompt: `Reopen ${t.title}`,
      })),
    };
  }

  // 7. DELETE TASK ACTION (Section 8, 13)
  // "Delete the seminar task", "Remove my old task", "Delete task-1"
  const isDeleteIntent =
    lower.startsWith('delete ') ||
    lower.startsWith('remove ') ||
    lower.startsWith('clear task ');

  if (isDeleteIntent) {
    let target = text
      .replace(/^delete\s+(?:the\s+)?(?:task\s+)?/i, '')
      .replace(/^remove\s+(?:the\s+)?(?:task\s+)?/i, '')
      .replace(/^clear\s+task\s+/i, '')
      .replace(/^my\s+/i, '')
      .replace(/\s+task$/i, '')
      .trim();

    if (!target) {
      return {
        replyText: 'Which task would you like to delete? Please specify the task title.',
      };
    }

    const matches = findMatchingTasks(currentTasks, target);

    if (matches.length === 0) {
      return {
        replyText: `I couldn't find a task matching "${target}" to delete.`,
      };
    }

    if (matches.length === 1) {
      const matched = matches[0];
      const updated = currentTasks.filter((t) => t.id !== matched.id);

      return {
        replyText: `Task deleted successfully:\n\n${formatSingleTask(matched)}`,
        updatedTasks: updated,
        executedAction: { type: 'delete', taskTitle: matched.title },
        suggestedActions: [
          { label: "Show all tasks", actionPrompt: "Show my tasks" },
        ],
      };
    }

    // Multiple matches: ask which one to delete
    return {
      replyText: `Multiple tasks match "${target}". Which task would you like to delete?`,
      disambiguationTasks: matches,
      suggestedActions: matches.map((t) => ({
        label: `Delete "${t.title.slice(0, 25)}"`,
        actionPrompt: `Delete ${t.title}`,
      })),
    };
  }

  // 8. EDIT TASK ACTION (Section 8)
  // "Change my Java task deadline to tomorrow", "Move the task to tomorrow", "Change priority of seminar to low"
  const isEditIntent =
    lower.includes('change ') ||
    lower.includes('move ') ||
    lower.includes('reschedule ') ||
    lower.includes('update ');

  if (isEditIntent && !lower.startsWith('add') && !lower.startsWith('create')) {
    // Check if moving/changing deadline
    const deadlineMatch = lower.match(/(?:deadline|due date|date|due)\s+(?:to\s+)?(.+)/i);
    const priorityMatch = lower.match(/(?:priority)\s+(?:to\s+)?(high|medium|low)/i);

    // Find the task mentioned
    for (const task of currentTasks) {
      if (lower.includes(task.title.toLowerCase()) || task.title.toLowerCase().split(' ').some((w) => w.length > 4 && lower.includes(w))) {
        let newDueDate = task.dueDate;
        let newPriority = task.priority;
        let changed = false;

        if (deadlineMatch) {
          const parsedDate = parseRelativeDate(deadlineMatch[1]);
          if (parsedDate) {
            newDueDate = parsedDate;
            changed = true;
          }
        } else if (lower.includes('tomorrow')) {
          newDueDate = parseRelativeDate('tomorrow');
          changed = true;
        } else if (lower.includes('today')) {
          newDueDate = todayStr;
          changed = true;
        }

        if (priorityMatch) {
          newPriority = priorityMatch[1] as Priority;
          changed = true;
        }

        if (changed) {
          const updatedTask = {
            ...task,
            dueDate: newDueDate,
            priority: newPriority,
          };
          const updatedList = currentTasks.map((t) =>
            t.id === task.id ? updatedTask : t
          );

          return {
            replyText: `Task updated successfully:\n\n${formatSingleTask(updatedTask)}`,
            updatedTasks: updatedList,
            executedAction: { type: 'edit', taskTitle: updatedTask.title },
          };
        }
      }
    }
  }

  // 9. ADD / CREATE TASK ACTION (Section 8, 15)
  // "Add a high priority task to complete Java assignment tomorrow"
  // "Remind me to study algorithms on Friday"
  // "I need to review operating systems"
  // "Add a task: Finish presentation"
  const isAddIntent =
    lower.startsWith('add ') ||
    lower.startsWith('create ') ||
    lower.startsWith('remind me to ') ||
    lower.startsWith('i need to ') ||
    lower.startsWith('new task');

  if (isAddIntent) {
    let clean = text
      .replace(/^add\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?/i, '')
      .replace(/^create\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?/i, '')
      .replace(/^remind\s+me\s+to\s+/i, '')
      .replace(/^i\s+need\s+to\s+/i, '')
      .replace(/^new\s+task:?\s*/i, '')
      .trim();

    // Priority detection
    let priority: Priority = 'medium';
    if (/\bhigh\s+priority\b/i.test(clean) || /\burgent\b/i.test(clean)) {
      priority = 'high';
      clean = clean.replace(/\bhigh\s+priority\b\s*/i, '').replace(/\burgent\b\s*/i, '');
    } else if (/\blow\s+priority\b/i.test(clean)) {
      priority = 'low';
      clean = clean.replace(/\blow\s+priority\b\s*/i, '');
    } else if (/\bmedium\s+priority\b/i.test(clean)) {
      priority = 'medium';
      clean = clean.replace(/\bmedium\s+priority\b\s*/i, '');
    }

    // Due date detection
    let dueDate = todayStr;
    const dateWords = ['tomorrow', 'today', 'tonight', 'next week', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const matchedDateWord = dateWords.find((w) => clean.toLowerCase().includes(w));

    if (matchedDateWord) {
      dueDate = parseRelativeDate(matchedDateWord);
      // Clean relative date from title
      clean = clean
        .replace(new RegExp(`\\b(?:on|by|due|for)?\\s*${matchedDateWord}\\b`, 'i'), '')
        .trim();
    } else {
      // Check for explicit ISO date or "in X days"
      const inDaysMatch = clean.match(/\bin\s+(\d+)\s+days?\b/i);
      if (inDaysMatch) {
        dueDate = parseRelativeDate(inDaysMatch[0]);
        clean = clean.replace(inDaysMatch[0], '').trim();
      }
    }

    // Optional description extraction: "description: ..." or "with description ..."
    let description = '';
    const descMatch = clean.match(/(?:with\s+description|description:)\s+(.+)/i);
    if (descMatch) {
      description = descMatch[1].trim();
      clean = clean.replace(descMatch[0], '').trim();
    }

    // Clean remaining title
    let title = clean
      .replace(/^(?:task\s+)?to\s+/i, '')
      .replace(/^:\s*/, '')
      .trim();

    // Capitalize first letter of title
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    if (!title) {
      return {
        replyText: 'What is the title of the task you would like to add?',
      };
    }

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      description,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...currentTasks];

    return {
      replyText:
        `Task added successfully to TaskEase!\n\n` +
        `${formatSingleTask(newTask)}`,
      updatedTasks,
      executedAction: { type: 'add', taskTitle: newTask.title },
      suggestedActions: [
        { label: "Show today's tasks", actionPrompt: "What do I need to do today?" },
        { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
      ],
    };
  }

  // 10. DEFAULT / GENERAL ASSISTANT RESPONSE
  // If the user says hello, asks what the agent can do, or general inquiries
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('help') || lower.includes('who are you')) {
    return {
      replyText:
        `👋 Hello! I am the **TaskEase AI Assistant**.\n\n` +
        `I can help you organize and manage your tasks:\n` +
        `• **Add tasks**: "Add a high priority task to complete Java assignment tomorrow"\n` +
        `• **Complete tasks**: "Complete Web Technology Project Report"\n` +
        `• **View filtered tasks**: "What's pending?", "Show high priority tasks", "What do I need to do today?"\n` +
        `• **Search**: "Find my project tasks"\n` +
        `• **Productivity stats**: "What are my stats?"\n` +
        `• **Delete or Edit**: "Delete the seminar task", "Move task to tomorrow"`,
      suggestedActions: [
        { label: "What do I need to do today?", actionPrompt: "What do I need to do today?" },
        { label: "What's pending?", actionPrompt: "What's pending?" },
        { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
      ],
    };
  }

  // Fallback: try searching if words match any task
  const matching = findMatchingTasks(currentTasks, text);
  if (matching.length > 0) {
    return {
      replyText:
        `Here are the tasks related to "${text}":\n\n` +
        `${formatTaskList(matching)}`,
      matchedTasks: matching,
      suggestedActions: matching.map((t) => ({
        label: t.completed ? `Reopen "${t.title.slice(0, 20)}"` : `Complete "${t.title.slice(0, 20)}"`,
        actionPrompt: t.completed ? `Reopen ${t.title}` : `Complete ${t.title}`,
      })),
    };
  }

  // Helpful guidance
  return {
    replyText:
      `I can help you manage your tasks in TaskEase. You can say things like:\n\n` +
      `• "What do I need to do today?"\n` +
      `• "Add a high priority task to complete Java assignment tomorrow"\n` +
      `• "Complete Web Technology Project Report"\n` +
      `• "Show high priority tasks"\n` +
      `• "What's pending?"`,
    suggestedActions: [
      { label: "What's pending?", actionPrompt: "What's pending?" },
      { label: "What do I need to do today?", actionPrompt: "What do I need to do today?" },
      { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
    ],
  };
}
