
import { describe, it, expect } from 'vitest';
import { getLoanDeadline } from './loan-status';

describe('getLoanDeadline', () => {
  const today = new Date(2026, 10, 27);

  it('should return active when more than 7 days remain', () => {
    const dueDate = new Date(2026, 11, 10);

    expect(getLoanDeadline(dueDate, today)).toEqual({
      status: 'active',
      daysRemaining: 13,
    });
  });

  it('should return due-soon when exactly 7 days remain', () => {
    const dueDate = new Date(2026, 11, 4);

    expect(getLoanDeadline(dueDate, today)).toEqual({
      status: 'due-soon',
      daysRemaining: 7,
    });
  });

  it('should return due-soon when the deadline is today', () => {
    expect(getLoanDeadline(today, today)).toEqual({
      status: 'due-soon',
      daysRemaining: 0,
    });
  });

  it('should return overdue when the deadline has passed', () => {
    const dueDate = new Date(2026, 10, 24);

    expect(getLoanDeadline(dueDate, today)).toEqual({
      status: 'overdue',
      daysRemaining: -3,
    });
  });

  it('should ignore the time when comparing dates', () => {
    const dueDate = new Date(2026, 10, 27, 8, 30);
    const currentTime = new Date(2026, 10, 27, 18, 45);

    expect(getLoanDeadline(dueDate, currentTime)).toEqual({
      status: 'due-soon',
      daysRemaining: 0,
    });
  });
});
