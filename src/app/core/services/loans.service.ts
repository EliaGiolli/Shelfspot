import { Inject, Injectable, computed, signal } from '@angular/core';
import type { Book } from '../../shared/types/book';
import type { Loan } from '../../shared/types/loans.types';
import { LOANS_REPOSITORY } from '../tokens/loans-repository,token';
import type { LoansRepository } from '../../features/loans/repository/loans.repository';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly loansSignal = signal<Loan[]>([]);
  private readonly initialization: Promise<void>;
  private pendingOperation: Promise<void> = Promise.resolve();

  readonly loans = this.loansSignal.asReadonly();
  readonly loanCount = computed(() => this.loansSignal().length);
  readonly isLoaded = signal(false);

  constructor(
    @Inject(LOANS_REPOSITORY)
    private readonly repository: LoansRepository
  ) {
    this.initialization = this.loadLoans();
  }

  private async loadLoans(): Promise<void> {
    try {
      const loans = await this.repository.getAll();
      this.loansSignal.set(loans);
    } catch (error) {
      console.error('Failed to load loans.', error);
      this.loansSignal.set([]);
    } finally {
      this.isLoaded.set(true);
    }
  }

  addLoan(book: Book): void {
    this.pendingOperation = this.pendingOperation
      .then(async () => {
        await this.initialization;

        if (this.isBorrowed(book.id)) {
          return;
        }

        const newLoan: Loan = {
          id: Math.random().toString(36).substring(2),
          book,
          loanDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        };

        const updated = [...this.loansSignal(), newLoan];

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

        const updated = this.loansSignal().filter(
          loan => loan.id !== loanId
        );

        await this.repository.saveAll(updated);
        this.loansSignal.set(updated);
      })
      .catch(error => {
        console.error('Failed to update loans.', error);
      });
  }

  isBorrowed(bookId: string): boolean {
    return this.loansSignal().some(loan => loan.book.id === bookId);
  }
}
