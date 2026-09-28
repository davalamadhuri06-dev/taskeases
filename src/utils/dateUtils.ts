/**
 * Date utilities for TaskEase
 * Reference date aligns with current context: 2026-09-28
 */

export const REFERENCE_TODAY = '2026-09-28';

export function getTodayDateString(): string {
  // If actual system year is around 2026, use today, otherwise anchor to 2026-09-28 for demo continuity
  const now = new Date();
  if (now.getFullYear() === 2026) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return REFERENCE_TODAY;
}

export function formatDateToDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getRelativeDueDateLabel(dueDateStr: string, todayStr = getTodayDateString()): {
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
  isOverdue: boolean;
} {
  if (!dueDateStr) {
    return { label: 'No date', isToday: false, isTomorrow: false, isOverdue: false };
  }

  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const [dY, dM, dD] = dueDateStr.split('-').map(Number);

  const todayDate = new Date(tY, tM - 1, tD);
  const dueDate = new Date(dY, dM - 1, dD);

  const diffTime = dueDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Today', isToday: true, isTomorrow: false, isOverdue: false };
  } else if (diffDays === 1) {
    return { label: 'Tomorrow', isToday: false, isTomorrow: true, isOverdue: false };
  } else if (diffDays === -1) {
    return { label: 'Yesterday', isToday: false, isTomorrow: false, isOverdue: true };
  } else if (diffDays < -1) {
    return { label: `${Math.abs(diffDays)} days overdue`, isToday: false, isTomorrow: false, isOverdue: true };
  } else if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, isToday: false, isTomorrow: false, isOverdue: false };
  }

  return { label: formatDateToDisplay(dueDateStr), isToday: false, isTomorrow: false, isOverdue: false };
}

/**
 * Natural language relative date parsing
 */
export function parseRelativeDate(text: string, referenceDateStr = getTodayDateString()): string {
  const [tY, tM, tD] = referenceDateStr.split('-').map(Number);
  const base = new Date(tY, tM - 1, tD);

  const lower = text.toLowerCase();

  // Explicit ISO date match: YYYY-MM-DD
  const isoMatch = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  if (lower.includes('today') || lower.includes('tonight')) {
    return referenceDateStr;
  }

  if (lower.includes('tomorrow')) {
    base.setDate(base.getDate() + 1);
    return formatDateIso(base);
  }

  if (lower.includes('day after tomorrow')) {
    base.setDate(base.getDate() + 2);
    return formatDateIso(base);
  }

  // "in X days"
  const inDaysMatch = lower.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    base.setDate(base.getDate() + days);
    return formatDateIso(base);
  }

  // "next week"
  if (lower.includes('next week')) {
    base.setDate(base.getDate() + 7);
    return formatDateIso(base);
  }

  // Day names: "next monday", "this friday", etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    const dayName = dayNames[i];
    if (lower.includes(dayName)) {
      const currentDay = base.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // next occurrence
      base.setDate(base.getDate() + diff);
      return formatDateIso(base);
    }
  }

  // "October 1" or "Oct 1"
  const monthNames: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9,
    oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12
  };

  const monthDayMatch = lower.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?/);
  if (monthDayMatch) {
    const month = monthNames[monthDayMatch[1]];
    const day = parseInt(monthDayMatch[2], 10);
    if (month && day >= 1 && day <= 31) {
      const year = tY;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Fallback to reference date if no date parsed
  return referenceDateStr;
}

export function formatDateIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
