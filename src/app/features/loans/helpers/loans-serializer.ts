// transforms `loanDate` e `dueDate` intp ISO 8601 strings
import type { Loan } from '../../../shared/types/loans.types';
import type { PersistedLoan } from '../repository/persisted-loan.schema';

// serializes a single loan
export function serializeLoan(loan: Loan): PersistedLoan {
  return {
    id: loan.id,
    book: loan.book,
    loanDate: loan.loanDate.toISOString(),
    dueDate: loan.dueDate.toISOString(),
  };
}

// serializes a collection of loans
export function serializeLoans(loans: Loan[]): PersistedLoan[] {
  return loans.map(serializeLoan);
}
