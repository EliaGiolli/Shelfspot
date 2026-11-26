
import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { LoanService } from './loans.service';
import type { Book } from '../../shared/types/book';
import type { Loan } from '../../shared/types/loans.types';
import { LOANS_REPOSITORY } from '../tokens/loans-repository,token';

describe('LoanService', () => {
  let service: LoanService;

  let repositoryMock: {
    getAll: ReturnType<typeof vi.fn>;
    saveAll: ReturnType<typeof vi.fn>;
  };

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/book-1',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    subjects: ['Fantasy'],
    coverId: 123,
    firstPublishYear: 1937,
    description: 'A fantasy novel.',
  };

  const mockLoan: Loan = {
    id: 'loan-1',
    book: mockBook,
    loanDate: new Date('2026-01-01T10:00:00.000Z'),
    dueDate: new Date('2026-01-15T10:00:00.000Z'),
  };

  function recreateService(): void {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        LoanService,
        {
          provide: LOANS_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    });

    service = TestBed.inject(LoanService);
  }

  beforeEach(() => {
    repositoryMock = {
      getAll: vi.fn().mockResolvedValue([]),
      saveAll: vi.fn().mockResolvedValue(undefined),
    };

    recreateService();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty loans list', async () => {
    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });

    expect(service.loans()).toEqual([]);
    expect(service.loanCount()).toBe(0);
  });

  it('should load saved loans from the repository', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    recreateService();

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([mockLoan]);
    });
  });

  it('should expose the loaded state', async () => {
    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });
  });

  it('should add a new loan', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    expect(service.loans()[0].book).toEqual(mockBook);
  });

  it('should persist a new loan through the repository', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenCalled();
    });

    expect(repositoryMock.saveAll).toHaveBeenCalledWith([
      expect.objectContaining({
        book: mockBook,
      }),
    ]);
  });

  it('should generate an ID for a new loan', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    expect(service.loans()[0].id).toEqual(expect.any(String));
    expect(service.loans()[0].id.length).toBeGreaterThan(0);
  });

  it('should set the loan date when a book is borrowed', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    expect(service.loans()[0].loanDate).toBeInstanceOf(Date);
  });

  it('should set the due date 14 days after the loan date', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    const loan = service.loans()[0];
    const expectedDuration = 14 * 24 * 60 * 60 * 1000;

    expect(loan.dueDate.getTime() - loan.loanDate.getTime())
      .toBe(expectedDuration);
  });

  it('should identify a borrowed book', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.isBorrowed(mockBook.id)).toBe(true);
    });
  });

  it('should return false when a book is not borrowed', () => {
    expect(service.isBorrowed(mockBook.id)).toBe(false);
  });

  it('should prevent borrowing the same book twice', async () => {
    service.addLoan(mockBook);
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    expect(repositoryMock.saveAll).toHaveBeenCalledTimes(1);
  });

  it('should update loanCount when a loan is added', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loanCount()).toBe(1);
    });
  });

  it('should return a book and remove its loan', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    const loanId = service.loans()[0].id;

    service.returnBook(loanId);

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([]);
    });

    expect(service.loanCount()).toBe(0);
    expect(service.isBorrowed(mockBook.id)).toBe(false);
  });

  it('should persist the removal of a loan', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    service.returnBook(service.loans()[0].id);

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenLastCalledWith([]);
    });
  });

  it('should not change the loans list when returning an unknown loan ID', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    const loansBeforeReturn = service.loans();

    service.returnBook('unknown-id');

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenCalledTimes(2);
    });

    expect(service.loans()).toEqual(loansBeforeReturn);
  });

  it('should allow borrowing a book again after it has been returned', async () => {
    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    service.returnBook(service.loans()[0].id);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(0);
    });

    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    expect(service.isBorrowed(mockBook.id)).toBe(true);
  });

  it('should preserve the order of consecutive operations', async () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      title: 'The Lord of the Rings',
    };

    service.addLoan(mockBook);
    service.addLoan(secondBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(2);
    });

    expect(service.loans().map(loan => loan.book.id)).toEqual([
      'book-1',
      'book-2',
    ]);

    expect(repositoryMock.saveAll).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ book: mockBook }),
        expect.objectContaining({ book: secondBook }),
      ])
    );
  });

  it('should handle repository loading errors', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    repositoryMock.getAll.mockRejectedValue(
      new Error('Storage error')
    );

    recreateService();

    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });

    expect(service.loans()).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });

  it('should handle repository saving errors', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    repositoryMock.saveAll.mockRejectedValue(
      new Error('Storage error')
    );

    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    expect(service.loans()).toEqual([]);
  });
});
