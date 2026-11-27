import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';

import { LoansPage } from './loans-page';
import { LoanService } from '../../../core/services/loans.service';

import type { Loan } from '../../../shared/types/loans.types';

describe('LoansPage', () => {
  let fixture: ComponentFixture<LoansPage>;

  let currentLoans: ReturnType<typeof signal<Loan[]>>;
  let isLoaded: ReturnType<typeof signal<boolean>>;
  let loadError: ReturnType<typeof signal<string | null>>;

  let retryLoadMock: ReturnType<typeof vi.fn>;
  let returnBookMock: ReturnType<typeof vi.fn>;

  const mockBook = {
    id: 'book-1',
    key: '/works/OL123W',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    coverId: 123,
    firstPublishYear: 1937,
    subjects: ['Fantasy']
  };

  const createLoan = (overrides: Partial<Loan> = {}): Loan => ({
    id: 'loan-1',
    book: mockBook,
    loanDate: new Date(2026, 10, 1),
    dueDate: new Date(2026, 11, 1),
    ...overrides
  });

  const render = (): void => {
    fixture.detectChanges();
  };

  beforeEach(async () => {
    currentLoans = signal<Loan[]>([]);
    isLoaded = signal(true);
    loadError = signal<string | null>(null);

    retryLoadMock = vi.fn().mockResolvedValue(undefined);
    returnBookMock = vi.fn();

    const loanServiceMock = {
      loans: currentLoans.asReadonly(),
      loanCount: computed(() => currentLoans().length),
      isLoaded: isLoaded.asReadonly(),
      loadError: loadError.asReadonly(),
      retryLoad: retryLoadMock,
      returnBook: returnBookMock
    };

    await TestBed.configureTestingModule({
      imports: [LoansPage],
      providers: [
      provideRouter([]),
        {
          provide: LoanService,
          useValue: loanServiceMock
        }
      ] 
    }).compileComponents();

    fixture = TestBed.createComponent(LoansPage);
  });

  it('should create', () => {
    render();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the page heading', () => {
    render();

    const heading: HTMLElement | null =
      fixture.nativeElement.querySelector('h1');

    expect(heading?.textContent).toContain('Loans');
  });

  // Loading state

  it('should display the loading state while loans are loading', () => {
    isLoaded.set(false);

    render();

    expect(
      fixture.nativeElement.querySelector('[role="status"]')
    ).not.toBeNull();

    expect(fixture.nativeElement.textContent)
      .toContain('Loading your loans');
  });

  it('should not display the empty state while loading', () => {
    isLoaded.set(false);

    render();

    expect(fixture.nativeElement.textContent)
      .not.toContain('No active loans');
  });

  // Error state

  it('should display the error state when loading fails', () => {
    loadError.set(
      'Unable to load your loans. Please try again.'
    );

    render();

    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
    ).not.toBeNull();

    expect(fixture.nativeElement.textContent)
      .toContain('Unable to load your loans');
  });

  it('should display a retry button when loading fails', () => {
    loadError.set(
      'Unable to load your loans. Please try again.'
    );

    render();

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('app-button button');

    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('Try again');
  });

  it('should retry loading when the retry button is clicked', () => {
    loadError.set(
      'Unable to load your loans. Please try again.'
    );

    render();

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('app-button button');

    button?.click();

    expect(retryLoadMock).toHaveBeenCalledOnce();
  });

  // Empty state

  it('should display the empty state when there are no loans', () => {
    currentLoans.set([]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('No active loans');
  });

  it('should provide a link to the catalog in the empty state', () => {
    currentLoans.set([]);

    render();

    const link: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a[routerLink="/books/search"]');

    expect(link).not.toBeNull();
    expect(link?.textContent).toContain('Explore books');
  });

  // Successful loans state

  it('should render a loaned book', () => {
    currentLoans.set([createLoan()]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('The Hobbit');
  });

  it('should display the book author', () => {
    currentLoans.set([createLoan()]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('J.R.R. Tolkien');
  });

  it('should display Unknown Author when authors are missing', () => {
    currentLoans.set([
      createLoan({
        book: {
          ...mockBook,
          authors: []
        }
      })
    ]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('Unknown Author');
  });

  it('should display the book cover with descriptive alt text', () => {
    currentLoans.set([createLoan()]);

    render();

    const cover: HTMLImageElement | null =
      fixture.nativeElement.querySelector('img[alt^="Cover of"]');

    expect(cover).not.toBeNull();
    expect(cover?.alt).toBe('Cover of The Hobbit');
    expect(cover?.getAttribute('loading')).toBe('lazy');
  });

  it('should display the borrowed and return dates', () => {
    currentLoans.set([createLoan()]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('Borrowed:');

    expect(fixture.nativeElement.textContent)
      .toContain('Return by:');
  });

  // Loan deadline states

  it('should display an active loan status', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    currentLoans.set([
      createLoan({ dueDate })
    ]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('Due in 15 days');
  });

  it('should display a due-soon status', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    currentLoans.set([
      createLoan({ dueDate })
    ]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('Due in 5 days');
  });

  it('should display Due today when the loan is due today', () => {
    currentLoans.set([
      createLoan({ dueDate: new Date() })
    ]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('Due today');
  });

  it('should display an overdue status', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 3);

    currentLoans.set([
      createLoan({ dueDate })
    ]);

    render();

    expect(fixture.nativeElement.textContent)
      .toContain('Overdue by 3 days');
  });

  // Return action

  it('should display a Return button for each loan', () => {
    currentLoans.set([
      createLoan(),
      createLoan({
        id: 'loan-2',
        book: {
          ...mockBook,
          id: 'book-2',
          title: 'Dune'
        }
      })
    ]);

    render();

    const buttons =
      fixture.nativeElement.querySelectorAll('app-button');

    expect(buttons.length).toBe(2);
  });

  it('should provide a descriptive accessible label for the Return button', () => {
    currentLoans.set([createLoan()]);

    render();

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('app-button button');

    expect(button?.getAttribute('aria-label'))
      .toBe('Return The Hobbit');
  });

  it('should call returnBook with the correct loan ID', () => {
    currentLoans.set([createLoan()]);

    render();

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('app-button button');

    button?.click();

    expect(returnBookMock).toHaveBeenCalledOnce();
    expect(returnBookMock).toHaveBeenCalledWith('loan-1');
  });

  it('should display multiple active loans', () => {
    currentLoans.set([
      createLoan(),
      createLoan({
        id: 'loan-2',
        book: {
          ...mockBook,
          id: 'book-2',
          title: 'Dune',
          authors: ['Frank Herbert']
        }
      })
    ]);

    render();

    expect(fixture.nativeElement.textContent).toContain('The Hobbit');
    expect(fixture.nativeElement.textContent).toContain('Dune');
    expect(fixture.nativeElement.textContent).toContain('Frank Herbert');
  });
});
