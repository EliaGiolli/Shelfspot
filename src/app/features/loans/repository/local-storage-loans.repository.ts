
import { Injectable } from '@angular/core';
import type { Loan } from '../../../shared/types/loans.types';
import type { LoansRepository } from './loans.repository';
import { PersistedLoansSchema } from './persisted-loan.schema';
import { serializeLoans } from '../helpers/loans-serializer';
import { deserializeLoans } from '../helpers/loan-deserializer';

const STORAGE_KEY = 'shelfspot_loans';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageLoansRepository implements LoansRepository {
  async getAll(): Promise<Loan[]> {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(data);
    const validated = PersistedLoansSchema.parse(parsed);

    return deserializeLoans(validated);
  }

  async saveAll(loans: Loan[]): Promise<void> {
    const serialized = serializeLoans(loans);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  }
}
