export type LoanStatus = 'active' | 'due-soon' | 'overdue';

export interface LoanDeadline {
  status: LoanStatus;
  daysRemaining: number;
}

export function getLoanDeadline(
  dueDate: Date,
  today: Date = new Date()
): LoanDeadline {
  const due = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const daysRemaining = Math.round(
    (due.getTime() - current.getTime()) / millisecondsPerDay
  );

  if (daysRemaining < 0) {
    return { status: 'overdue', daysRemaining };
  }

  if (daysRemaining <= 7) {
    return { status: 'due-soon', daysRemaining };
  }

  return { status: 'active', daysRemaining };
}
