import type { Loan } from '../../../shared/types/loans.types';

export interface LoansRepository {
  getAll(): Promise<Loan[]>;
  saveAll(loans: Loan[]): Promise<void>;
}
