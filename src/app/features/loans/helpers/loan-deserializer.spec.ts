
import { describe, expect, it } from 'vitest';
import type { PersistedLoan } from '../repository/persisted-loan.schema';
import { deserializeLoan, deserializeLoans } from './loan-deserializer';

describe('Loan deserializer', () => {
  const loan: PersistedLoan = {
    id: 'loan-1',
    book: {
      id: 'book-1',
      key: '/works/book-1',
      title: 'The Hobbit',
      authors: ['J.R.R. Tolkien'],
      subjects: ['Fantasy'],
    },
    loanDate: '2026-11-01T10:00:00.000Z',
    dueDate: '2026-11-15T10:00:00.000Z',
  };

  it('should deserialize ISO strings into Date objects', () => {
    const result = deserializeLoan(loan);

    expect(result.loanDate).toBeInstanceOf(Date);
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.loanDate.toISOString()).toBe(loan.loanDate);
    expect(result.dueDate.toISOString()).toBe(loan.dueDate);
  });

  it('should preserve loan and book data', () => {
    const result = deserializeLoan(loan);

    expect(result.id).toBe(loan.id);
    expect(result.book).toEqual(loan.book);
  });

  it('should deserialize a collection of loans', () => {
    const result = deserializeLoans([loan, { ...loan, id: 'loan-2' }]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('loan-1');
    expect(result[1].id).toBe('loan-2');
    expect(result[0].loanDate).toBeInstanceOf(Date);
  });

  it('should return an empty array when there are no loans', () => {
    expect(deserializeLoans([])).toEqual([]);
  });
});
