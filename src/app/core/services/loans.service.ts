
import { Inject, Injectable, computed, signal } from '@angular/core';

import type { Book } from '../../shared/types/book';
import type { Loan } from '../../shared/types/loans.types';

import { AppError } from '../errors/app-error';
import { LOANS_REPOSITORY } from '../tokens/loans-repository.token';
import type { LoansRepository } from '../../features/loans/repository/loans.repository';

export type LoanActionStatus = 'idle' | 'loading' | 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly loansSignal = signal<Loan[]>([]);

  private initialization: Promise<void>;
  private pendingOperation: Promise<void> = Promise.resolve();
  private operationSequence = 0;

  readonly loans = this.loansSignal.asReadonly();
  readonly loanCount = computed(() => this.loansSignal().length);

  readonly isLoaded = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly actionStatus = signal<LoanActionStatus>('idle');
  readonly actionMessage = signal('');
  readonly actionError = signal<AppError | null>(null);

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
      const appError = new AppError(
        'Unable to load your loans. Please try again.',
        'storage',
        error
      );

      console.error(appError);

      this.loansSignal.set([]);
      this.loadError.set(appError.message);
    } finally {
      this.isLoaded.set(true);
    }
  }

  retryLoad(): Promise<void> {
    this.initialization = this.loadLoans();
    return this.initialization;
  }

  private executeOperation(
    action: () => Promise<string>,
    errorMessage: string
  ): Promise<boolean> {
    const operationId = ++this.operationSequence;

    this.actionStatus.set('loading');
    this.actionMessage.set('');
    this.actionError.set(null);

    const operation = this.pendingOperation.then(async () => {
      try {
        await this.initialization;

        if (this.loadError()) {
          throw new AppError(
            'Loan data could not be loaded.',
            'storage'
          );
        }

        const message = await action();

        if (operationId === this.operationSequence) {
          this.actionStatus.set('success');
          this.actionMessage.set(message);
        }

        return true;
      } catch (error) {
        const appError = error instanceof AppError
          ? error
          : new AppError(errorMessage, 'storage', error);

        console.error(appError);

        if (operationId === this.operationSequence) {
          this.actionStatus.set('error');
          this.actionMessage.set(errorMessage);
          this.actionError.set(appError);
        }

        return false;
      }
    });

    this.pendingOperation = operation.then(() => undefined);

    return operation;
  }

  addLoan(book: Book): Promise<boolean> {
    return this.executeOperation(
      async () => {
        if (this.isBorrowed(book.id)) {
          return `${book.title} is already in your loans.`;
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

        return `${book.title} has been added to your loans.`;
      },
      'Unable to borrow this book. Please try again.'
    );
  }

  returnBook(loanId: string): Promise<boolean> {
    return this.executeOperation(
      async () => {
        const current = this.loansSignal();
        const loan = current.find(item => item.id === loanId);

        if (!loan) {
          return 'This book is no longer in your active loans.';
        }

        const updated = current.filter(
          item => item.id !== loanId
        );

        await this.repository.saveAll(updated);
        this.loansSignal.set(updated);

        return `${loan.book.title} has been successfully returned.`;
      },
      'Unable to return this book. Please try again.'
    );
  }

  isBorrowed(bookId: string): boolean {
    return this.loansSignal().some(
      loan => loan.book.id === bookId
    );
  }
}
