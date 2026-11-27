import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

import { LoansPage } from './loans-page';
import { LoanService } from '../../../core/services/loans.service';

import type { Loan } from '../../../shared/types/loans.types';
import type { Book } from '../../../shared/types/book';
import type { LoanActionStatus } from '../../../core/services/loans.service';

describe('LoansPage', () => {
  let fixture: ComponentFixture<LoansPage>;
  let component: LoansPage;

  let loansSignal: ReturnType<typeof signal<Loan[]>>;
  let isLoadedSignal: ReturnType<typeof signal<boolean>>;
  let loadErrorSignal: ReturnType<typeof signal<string | null>>;
  let actionStatusSignal: ReturnType<typeof signal<LoanActionStatus>>;
  let actionMessageSignal: ReturnType<typeof signal<string>>;

  let loanServiceMock: {
    loans: typeof loansSignal;
    isLoaded: typeof isLoadedSignal;
    loadError: typeof loadErrorSignal;
    actionStatus: typeof actionStatusSignal;
    actionMessage: typeof actionMessageSignal;
    retryLoad: ReturnType<typeof vi.fn>;
    returnBook: ReturnType<typeof vi.fn>;
  };

  let animationFrames: FrameRequestCallback[];

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/book-1',
    title: 'Dune',
    authors: ['Frank Herbert'],
    subjects: [],
    coverId: 123
  };

  function createLoan(
    id: string,
    dueDate: Date,
    book: Book = mockBook
  ): Loan {
    return {
      id,
      book,
      loanDate: new Date(2026, 10, 1),
      dueDate
    };
  }

  function getDateOffset(days: number): Date {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
  }

  const activeLoan = createLoan('loan-1', getDateOffset(14));

  function render(): void {
    fixture.detectChanges();
  }

  
function getAppButtons(): HTMLButtonElement[] {
  const nativeElement = fixture.nativeElement as HTMLElement;

  return Array.from(
    nativeElement.querySelectorAll('app-button button')
  ) as HTMLButtonElement[];
}

function getReturnButtons(): HTMLButtonElement[] {
  return getAppButtons().filter(button => {
    const text = button.textContent?.trim() ?? '';

    return text.includes('Return Book') || text.includes('Processing');
  });
}


  function flushAnimationFrames(): void {
    const callbacks = [...animationFrames];
    animationFrames = [];

    callbacks.forEach(callback => callback(0));
  }

  beforeEach(async () => {
    loansSignal = signal<Loan[]>([]);
    isLoadedSignal = signal(false);
    loadErrorSignal = signal<string | null>(null);
    actionStatusSignal = signal<LoanActionStatus>('idle');
    actionMessageSignal = signal('');

    animationFrames = [];

    loanServiceMock = {
      loans: loansSignal,
      isLoaded: isLoadedSignal,
      loadError: loadErrorSignal,
      actionStatus: actionStatusSignal,
      actionMessage: actionMessageSignal,
      retryLoad: vi.fn().mockResolvedValue(undefined),
      returnBook: vi.fn().mockResolvedValue(true)
    };

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        animationFrames.push(callback);
        return animationFrames.length;
      })
    );

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
    component = fixture.componentInstance;

    render();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page heading', () => {
    isLoadedSignal.set(true);
    render();

    expect(fixture.nativeElement.textContent).toContain('My Loans');
  });

  it('should display the loading state while loans are loading', () => {
    isLoadedSignal.set(false);
    render();

    expect(fixture.nativeElement.textContent).toContain(
      'Loading your loans...'
    );

    expect(
      fixture.nativeElement.querySelector('[role="status"]')
    ).not.toBeNull();
  });

  it('should not display the empty state while loading', () => {
    isLoadedSignal.set(false);
    render();

    expect(fixture.nativeElement.textContent).not.toContain(
      'No books borrowed yet'
    );
  });

  it('should display the error state when loading fails', () => {
    isLoadedSignal.set(true);
    loadErrorSignal.set('Storage failure');
    render();

    expect(fixture.nativeElement.textContent).toContain(
      'Unable to load your loans'
    );

    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
    ).not.toBeNull();
  });

  it('should display a retry button when loading fails', () => {
    isLoadedSignal.set(true);
    loadErrorSignal.set('Storage failure');
    render();

    const retryButton = getAppButtons().find(button =>
      button.textContent?.includes('Retry')
    );

    expect(retryButton).toBeTruthy();
  });

  it('should retry loading when the retry button is clicked', () => {
    isLoadedSignal.set(true);
    loadErrorSignal.set('Storage failure');
    render();

    const retryButton = getAppButtons().find(button =>
      button.textContent?.includes('Retry')
    );

    retryButton?.click();
    expect(loanServiceMock.retryLoad).toHaveBeenCalledOnce();
  });

  it('should display the empty state when there are no loans', () => {
    isLoadedSignal.set(true);
    loansSignal.set([]);
    render();

    expect(fixture.nativeElement.textContent).toContain(
      'No books borrowed yet'
    );
  });

  it('should provide a link to the catalog in the empty state', () => {
    isLoadedSignal.set(true);
    loansSignal.set([]);
    render();

    const catalogLink = fixture.nativeElement.querySelector(
      'a[routerLink="/books/search"]'
    );

    expect(catalogLink).not.toBeNull();
  });

  it('should make the empty state heading programmatically focusable', () => {
    isLoadedSignal.set(true);
    loansSignal.set([]);
    render();

    const heading = fixture.nativeElement.querySelector(
      '#empty-loans-heading'
    ) as HTMLHeadingElement;

    expect(heading).not.toBeNull();
    expect(heading.getAttribute('tabindex')).toBe('-1');
  });

  it('should render a loaned book', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Dune');
  });

  it('should display the book author', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Frank Herbert');
  });

  it('should display Unknown Author when authors are missing', () => {
    const bookWithoutAuthors: Book = {
      ...mockBook,
      authors: []
    };

    isLoadedSignal.set(true);
    loansSignal.set([
      createLoan('loan-2', getDateOffset(14), bookWithoutAuthors)
    ]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Unknown Author');
  });

  it('should display the book cover with descriptive alt text', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    const image = fixture.nativeElement.querySelector(
      'img[alt="Cover of Dune"]'
    );

    expect(image).not.toBeNull();
  });

  it('should display the borrowed and return dates', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Borrowed:');
    expect(fixture.nativeElement.textContent).toContain('Return date:');
  });

  it('should display an active loan status', () => {
    isLoadedSignal.set(true);
    loansSignal.set([createLoan('loan-1', getDateOffset(14))]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Due in 14 days');
  });

  it('should display a due-soon status', () => {
    isLoadedSignal.set(true);
    loansSignal.set([createLoan('loan-1', getDateOffset(3))]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Due in 3 days');
  });

  it('should display Due today when the loan is due today', () => {
    isLoadedSignal.set(true);
    loansSignal.set([createLoan('loan-1', getDateOffset(0))]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Due today');
  });

  it('should display an overdue status', () => {
    isLoadedSignal.set(true);
    loansSignal.set([createLoan('loan-1', getDateOffset(-3))]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Overdue by 3 days');
  });

  it('should display a Return button for each loan', () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      title: 'Foundation'
    };

    isLoadedSignal.set(true);
    loansSignal.set([
      activeLoan,
      createLoan('loan-2', getDateOffset(20), secondBook)
    ]);
    render();

    expect(getReturnButtons()).toHaveLength(2);
  });

  it('should provide a descriptive accessible label for the Return button', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    const button = getReturnButtons()[0];

    expect(button.getAttribute('aria-label')).toBe('Return Dune');
  });

  it('should call returnBook with the correct loan ID', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    getReturnButtons()[0].click();

    expect(loanServiceMock.returnBook).toHaveBeenCalledWith('loan-1');
  });

  it('should disable Return buttons while an operation is loading', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    actionStatusSignal.set('loading');
    render();

    expect(getReturnButtons()[0].disabled).toBe(true);
  });

  it('should enable Return buttons when no operation is loading', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    actionStatusSignal.set('idle');
    render();

    expect(getReturnButtons()[0].disabled).toBe(false);
  });

  it('should display the successful return message', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    actionStatusSignal.set('success');
    actionMessageSignal.set('Dune has been successfully returned.');
    render();

    expect(fixture.nativeElement.textContent).toContain(
      'Dune has been successfully returned.'
    );
  });

  it('should display the return error message', () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    actionStatusSignal.set('error');
    actionMessageSignal.set(
      'Unable to return this book. Please try again.'
    );
    render();

    expect(fixture.nativeElement.textContent).toContain(
      'Unable to return this book. Please try again.'
    );
  });

  it('should move focus to the next Return button after returning a book', async () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      title: 'Foundation'
    };

    const firstLoan = createLoan('loan-1', getDateOffset(14));
    const secondLoan = createLoan(
      'loan-2',
      getDateOffset(20),
      secondBook
    );

    isLoadedSignal.set(true);
    loansSignal.set([firstLoan, secondLoan]);
    render();

    loanServiceMock.returnBook.mockImplementation(async (loanId: string) => {
      loansSignal.set(
        loansSignal().filter(loan => loan.id !== loanId)
      );
      return true;
    });

    await component.returnLoan('loan-1');

    render();
    flushAnimationFrames();

    expect(getReturnButtons()).toHaveLength(1);
    expect(document.activeElement).toBe(getReturnButtons()[0]);
  });

  it('should move focus to the empty state heading after returning the last book', async () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    loanServiceMock.returnBook.mockImplementation(async (loanId: string) => {
      loansSignal.set(
        loansSignal().filter(loan => loan.id !== loanId)
      );
      return true;
    });

    await component.returnLoan('loan-1');

    render();
    flushAnimationFrames();

    const heading = fixture.nativeElement.querySelector(
      '#empty-loans-heading'
    ) as HTMLHeadingElement;

    expect(heading).not.toBeNull();
    expect(document.activeElement).toBe(heading);
  });

  it('should not move focus when returning a book fails', async () => {
    isLoadedSignal.set(true);
    loansSignal.set([activeLoan]);
    render();

    const returnButton = getReturnButtons()[0];
    returnButton.focus();

    loanServiceMock.returnBook.mockResolvedValue(false);

    await component.returnLoan('loan-1');

    render();
    flushAnimationFrames();

    expect(document.activeElement).toBe(returnButton);
  });

  it('should display multiple active loans', () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      title: 'Foundation'
    };

    isLoadedSignal.set(true);
    loansSignal.set([
      activeLoan,
      createLoan('loan-2', getDateOffset(20), secondBook)
    ]);
    render();

    expect(fixture.nativeElement.textContent).toContain('Dune');
    expect(fixture.nativeElement.textContent).toContain('Foundation');
    expect(getReturnButtons()).toHaveLength(2);
  });
});
