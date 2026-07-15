import type { SavingsGoal } from '@prisma/client';

export type GoalEntity = SavingsGoal;

export interface GoalProgress {
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageComplete: number;
  isCompleted: boolean;
  /** Days until targetDate; null if no targetDate was set; negative means overdue. */
  daysRemaining: number | null;
  /**
   * Heuristic estimate based on the average daily savings rate since the goal
   * was created (no contribution history is stored, so this is an approximation,
   * not a precise forecast). Null while there's no positive savings rate yet.
   */
  estimatedCompletionDate: string | null;
  /** Whether the estimated completion date is on/before the targetDate. Null if no targetDate. */
  isOnTrack: boolean | null;
}

export type GoalWithProgress = GoalEntity & { progress: GoalProgress };
