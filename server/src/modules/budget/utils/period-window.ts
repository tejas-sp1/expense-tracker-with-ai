import type { BudgetPeriod } from '@prisma/client';

export interface PeriodWindow {
  start: Date;
  end: Date;
}

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function endOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

/**
 * Computes the currently-active date window for a budget based on its period type.
 * WEEKLY/MONTHLY/QUARTERLY/YEARLY windows are anchored to the current calendar
 * period (this week/month/quarter/year), not to the budget's startDate — this
 * matches how most budgeting apps present "this month's budget" regardless of
 * when the budget was originally created.
 * CUSTOM periods use the explicit startDate/endDate stored on the budget.
 */
export function getCurrentPeriodWindow(
  period: BudgetPeriod,
  startDate: Date,
  endDate: Date | null,
  now: Date = new Date(),
): PeriodWindow {
  switch (period) {
    case 'WEEKLY': {
      const day = now.getUTCDay(); // 0 = Sunday
      const start = new Date(now);
      start.setUTCDate(now.getUTCDate() - day);
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 6);
      return { start: startOfDayUTC(start), end: endOfDayUTC(end) };
    }
    case 'MONTHLY': {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
      return { start: startOfDayUTC(start), end: endOfDayUTC(end) };
    }
    case 'QUARTERLY': {
      const quarter = Math.floor(now.getUTCMonth() / 3);
      const start = new Date(Date.UTC(now.getUTCFullYear(), quarter * 3, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), quarter * 3 + 3, 0));
      return { start: startOfDayUTC(start), end: endOfDayUTC(end) };
    }
    case 'YEARLY': {
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31));
      return { start: startOfDayUTC(start), end: endOfDayUTC(end) };
    }
    case 'CUSTOM':
    default: {
      const start = startOfDayUTC(startDate);
      const end = endDate ? endOfDayUTC(endDate) : endOfDayUTC(now);
      return { start, end };
    }
  }
}
