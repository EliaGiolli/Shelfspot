import { Injectable, signal, computed } from '@angular/core';
import { type Book } from '../../shared/types/book';
import { type Loan } from '../../shared/types/loans.types';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private loansSignal = signal<Loan[]>([]);

  loans = this.loansSignal.asReadonly();

  loanCount = computed(() => this.loansSignal().length);

  addLoan(book: Book) {
    if (this.isBorrowed(book.id)) return;

    const newLoan: Loan = {
      id: Math.random().toString(36).substring(2),
      book,
      loanDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };

    this.loansSignal.update(current => [...current, newLoan]);
  }

  isBorrowed(bookId: string): boolean {
    return this.loansSignal().some(loan => loan.book.id === bookId);
  }

  returnBook(loanId: string) {
    this.loansSignal.update(current => current.filter(l => l.id !== loanId));
  }
}
