
import { describe, expect, it } from 'vitest';
import type { Loan } from '../../../shared/types/loans.types';
import { serializeLoan, serializeLoans } from './loans-serializer';

describe('Loan serializer', () => {
  const loan: Loan = {
    id: 'loan-1',
    book: {
      id: 'book-1',
      key: '/works/book-1',
      title: 'The Hobbit',
      authors: ['J.R.R. Tolkien'],
      subjects: ['Fantasy'],
    },
    loanDate: new Date('2026-11-01T10:00:00.000Z'),
    dueDate: new Date('2026-11-15T10:00:00.000Z'),
  };

  it('should serialize loan dates to ISO 8601 strings', () => {
    const result = serializeLoan(loan);

    expect(result.loanDate).toBe('2026-11-01T10:00:00.000Z');
    expect(result.dueDate).toBe('2026-11-15T10:00:00.000Z');
  });

  it('should preserve loan and book data', () => {
    const result = serializeLoan(loan);

    expect(result.id).toBe(loan.id);
    expect(result.book).toEqual(loan.book);
  });

  it('should serialize a collection of loans', () => {
    const result = serializeLoans([loan, { ...loan, id: 'loan-2' }]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('loan-1');
    expect(result[1].id).toBe('loan-2');
  });

  it('should return an empty array when there are no loans', () => {
    expect(serializeLoans([])).toEqual([]);
  });
});
