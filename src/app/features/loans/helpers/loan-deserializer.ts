// transform a PersistedLoan into a Loan
import type { Loan } from '../../../shared/types/loans.types';
import type { PersistedLoan } from '../repository/persisted-loan.schema';

export function deserializeLoan(loan: PersistedLoan): Loan {
  return {
    id: loan.id,
    book: loan.book,
    loanDate: new Date(loan.loanDate),
    dueDate: new Date(loan.dueDate),
  };
}

export function deserializeLoans(loans: PersistedLoan[]): Loan[] {
  return loans.map(deserializeLoan);
}
