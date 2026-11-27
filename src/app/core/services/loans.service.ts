
import { Inject, Injectable, computed, signal } from '@angular/core';

import type { Book } from '../../shared/types/book';
import type { Loan } from '../../shared/types/loans.types';

import { LOANS_REPOSITORY } from '../tokens/loans-repository,token';
import type { LoansRepository } from '../../features/loans/repository/loans.repository';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly loansSignal = signal<Loan[]>([]);

  private initialization: Promise<void>;
  private pendingOperation: Promise<void> = Promise.resolve();

  readonly loans = this.loansSignal.asReadonly();
  readonly loanCount = computed(() => this.loansSignal().length);

  readonly isLoaded = signal(false);
  readonly loadError = signal<string | null>(null);

  constructor(
    @Inject(LOANS_REPOSITORY)
    private readonly repository: LoansRepository
  ) {
    this.initialization = this.loadLoans();
  }

  private async loadLoans(): Promise<void> {
    this.isLoaded.set(false);
    this.loadError.set(null);

    try {
      const loans = await this.repository.getAll();

      this.loansSignal.set(loans);
    } catch (error) {
      console.error('Failed to load loans.', error);

      this.loansSignal.set([]);
      this.loadError.set(
        'Unable to load your loans. Please try again.'
      );
    } finally {
      this.isLoaded.set(true);
    }
  }

  retryLoad(): Promise<void> {
    this.initialization = this.loadLoans();

    return this.initialization;
  }

  addLoan(book: Book): void {
    this.pendingOperation = this.pendingOperation
      .then(async () => {
        await this.initialization;

        if (this.loadError()) {
          return;
        }

        if (this.isBorrowed(book.id)) {
          return;
        }

        const loanDate = new Date();
        const dueDate = new Date(loanDate);

        dueDate.setDate(dueDate.getDate() + 30);

        const newLoan: Loan = {
          id: Math.random().toString(36).substring(2),
          book,
          loanDate,
          dueDate
        };

        const updated = [
          ...this.loansSignal(),
          newLoan
        ];

        await this.repository.saveAll(updated);

        this.loansSignal.set(updated);
      })
      .catch(error => {
        console.error('Failed to update loans.', error);
      });
  }

  returnBook(loanId: string): void {
    this.pendingOperation = this.pendingOperation
      .then(async () => {
        await this.initialization;

        if (this.loadError()) {
          return;
        }

        const current = this.loansSignal();

        const updated = current.filter(
          loan => loan.id !== loanId
        );

        if (updated.length === current.length) {
          return;
        }

        await this.repository.saveAll(updated);

        this.loansSignal.set(updated);
      })
      .catch(error => {
        console.error('Failed to update loans.', error);
      });
  }

  isBorrowed(bookId: string): boolean {
    return this.loansSignal().some(
      loan => loan.book.id === bookId
    );
  }
}
