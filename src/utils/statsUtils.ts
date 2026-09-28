import { Task, DashboardStatistics } from '../types/task';

export function calculateDashboardStatistics(tasks: Task[]): DashboardStatistics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high').length;

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  let productivityMessage: string;

  if (totalTasks === 0) {
    productivityMessage = 'Add your first task to get started!';
  } else if (completionPercentage === 100) {
    productivityMessage = '🎉 Incredible job! All tasks are completed!';
  } else if (completionPercentage >= 75) {
    productivityMessage = '🚀 Almost done! Just a few more tasks to go.';
  } else if (completionPercentage >= 50) {
    productivityMessage = '💪 Great momentum! You are halfway there.';
  } else if (completionPercentage >= 1) {
    productivityMessage = '✨ Nice start! Keep ticking tasks off.';
  } else {
    productivityMessage = 'Ready to conquer today? Start by checking off a task.';
  }

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    completionPercentage,
    productivityMessage,
  };
}
