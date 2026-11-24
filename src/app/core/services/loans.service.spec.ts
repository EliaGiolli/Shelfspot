
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { LoanService } from './loans.service';
import { type Book } from '../../shared/types/book';

describe('LoanService', () => {
  let service: LoanService;

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/book-1',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    subjects: ['Fantasy'],
    coverId: 123,
    firstPublishYear: 1937,
    description: 'A fantasy novel.',
  };

  beforeEach(() => {
    service = new LoanService();
    vi.useRealTimers();
  });

  it('should initialize with an empty loans list', () => {
    expect(service.loans()).toEqual([]);
    expect(service.loanCount()).toBe(0);
  });

  it('should add a new loan', () => {
    service.addLoan(mockBook);

    expect(service.loans()).toHaveLength(1);
    expect(service.loans()[0].book).toEqual(mockBook);
  });

  it('should generate an ID for a new loan', () => {
    service.addLoan(mockBook);

    expect(service.loans()[0].id).toEqual(expect.any(String));
    expect(service.loans()[0].id.length).toBeGreaterThan(0);
  });

  it('should set the loan date when a book is borrowed', () => {
    service.addLoan(mockBook);

    expect(service.loans()[0].loanDate).toBeInstanceOf(Date);
  });

  it('should set the due date 14 days after the loan date', () => {
    const now = new Date('2026-01-01T10:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    service.addLoan(mockBook);

    const loan = service.loans()[0];
    const expectedDueDate = new Date(
      now.getTime() + 14 * 24 * 60 * 60 * 1000
    );

    expect(loan.dueDate).toEqual(expectedDueDate);
  });

  it('should identify a borrowed book', () => {
    service.addLoan(mockBook);

    expect(service.isBorrowed(mockBook.id)).toBe(true);
  });

  it('should return false when a book is not borrowed', () => {
    expect(service.isBorrowed(mockBook.id)).toBe(false);
  });

  it('should prevent borrowing the same book twice', () => {
    service.addLoan(mockBook);
    service.addLoan(mockBook);

    expect(service.loans()).toHaveLength(1);
  });

  it('should update loanCount when a loan is added', () => {
    service.addLoan(mockBook);

    expect(service.loanCount()).toBe(1);
  });

  it('should return a book and remove its loan', () => {
    service.addLoan(mockBook);

    const loanId = service.loans()[0].id;

    service.returnBook(loanId);

    expect(service.loans()).toEqual([]);
    expect(service.loanCount()).toBe(0);
    expect(service.isBorrowed(mockBook.id)).toBe(false);
  });

  it('should not change the loans list when returning an unknown loan ID', () => {
    service.addLoan(mockBook);

    const loansBeforeReturn = service.loans();

    service.returnBook('unknown-id');

    expect(service.loans()).toEqual(loansBeforeReturn);
  });

  it('should allow borrowing a book again after it has been returned', () => {
    service.addLoan(mockBook);

    const loanId = service.loans()[0].id;

    service.returnBook(loanId);
    service.addLoan(mockBook);

    expect(service.loans()).toHaveLength(1);
    expect(service.isBorrowed(mockBook.id)).toBe(true);
  });
});
