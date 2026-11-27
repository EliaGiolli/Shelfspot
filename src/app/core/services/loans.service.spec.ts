import { TestBed } from '@angular/core/testing';
import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';

import { LoanService } from './loans.service';
import { LOANS_REPOSITORY } from '../tokens/loans-repository,token';

import type { Book } from '../../shared/types/book';
import type { Loan } from '../../shared/types/loans.types';

describe('LoanService', () => {
  let service: LoanService;

  let repositoryMock: {
    getAll: ReturnType<typeof vi.fn>;
    saveAll: ReturnType<typeof vi.fn>;
  };

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/OL123W',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    coverId: 123,
    firstPublishYear: 1937,
    subjects: ['Fantasy']
  };

  const mockLoan: Loan = {
    id: 'loan-1',
    book: mockBook,
    loanDate: new Date(2026, 10, 1),
    dueDate: new Date(2026, 11, 1)
  };

  const createService = (): LoanService => {
    repositoryMock.getAll.mockClear();
    repositoryMock.saveAll.mockClear();
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        LoanService,
        {
          provide: LOANS_REPOSITORY,
          useValue: repositoryMock
        }
      ]
    });

    return TestBed.inject(LoanService);
  };

  const waitForLoading = async (): Promise<void> => {
    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });
  };

  beforeEach(() => {
    repositoryMock = {
      getAll: vi.fn().mockResolvedValue([]),
      saveAll: vi.fn().mockResolvedValue(undefined)
    };

    service = createService();
  });

  // Initialization

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty loans list', () => {
    expect(service.loans()).toEqual([]);
  });

  it('should initialize with isLoaded set to false when loading is pending', () => {
    repositoryMock.getAll.mockReturnValue(
      new Promise<Loan[]>(() => {})
    );

    service = createService();

    expect(service.isLoaded()).toBe(false);
  });

  it('should load loans from the repository', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    expect(service.loans()).toEqual([mockLoan]);
    expect(repositoryMock.getAll).toHaveBeenCalledOnce();
  });

  it('should update loanCount after loading', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    expect(service.loanCount()).toBe(1);
  });

  it('should handle repository loading errors', async () => {
    repositoryMock.getAll.mockRejectedValue(
      new Error('Storage unavailable')
    );

    service = createService();

    await waitForLoading();

    expect(service.loans()).toEqual([]);
    expect(service.loadError()).toBe(
      'Unable to load your loans. Please try again.'
    );
  });

  it('should expose no loading error after successful initialization', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    expect(service.loadError()).toBeNull();
  });

  // Retry

  it('should retry loading loans', async () => {
    repositoryMock.getAll
      .mockRejectedValueOnce(new Error('Storage unavailable'))
      .mockResolvedValueOnce([mockLoan]);

    service = createService();

    await waitForLoading();

    expect(service.loadError()).not.toBeNull();

    await service.retryLoad();

    expect(service.loadError()).toBeNull();
    expect(service.loans()).toEqual([mockLoan]);
    expect(repositoryMock.getAll).toHaveBeenCalledTimes(2);
  });

  it('should clear previous loans when a retry fails', async () => {
    repositoryMock.getAll
      .mockResolvedValueOnce([mockLoan])
      .mockRejectedValueOnce(new Error('Storage unavailable'));

    service = createService();

    await waitForLoading();

    expect(service.loans()).toEqual([mockLoan]);

    await service.retryLoad();

    expect(service.loans()).toEqual([]);
    expect(service.loadError()).not.toBeNull();
  });

  // Adding loans

  it('should add a new loan', async () => {
    await waitForLoading();

    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    expect(service.loans()[0].book).toEqual(mockBook);
    expect(repositoryMock.saveAll).toHaveBeenCalledOnce();
  });

  it('should not add a duplicate loan', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    service.addLoan(mockBook);

    await Promise.resolve();

    expect(service.loans()).toHaveLength(1);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  it('should set the due date 30 calendar days after the loan date', async () => {
    await waitForLoading();

    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(1);
    });

    const loan = service.loans()[0];

    const expectedDueDate = new Date(loan.loanDate);
    expectedDueDate.setDate(expectedDueDate.getDate() + 30);

    expect(loan.dueDate).toEqual(expectedDueDate);
  });

  it('should expose whether a book is borrowed', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    expect(service.isBorrowed('book-1')).toBe(true);
    expect(service.isBorrowed('book-2')).toBe(false);
  });

  it('should update loanCount after adding a loan', async () => {
    await waitForLoading();

    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(service.loanCount()).toBe(1);
    });
  });

  it('should not update loans if saving a new loan fails', async () => {
    repositoryMock.saveAll.mockRejectedValue(
      new Error('Storage unavailable')
    );

    await waitForLoading();

    service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenCalledOnce();
    });

    expect(service.loans()).toEqual([]);
  });

  it('should not add a loan if initial loading failed', async () => {
    repositoryMock.getAll.mockRejectedValue(
      new Error('Storage unavailable')
    );

    service = createService();

    await waitForLoading();

    service.addLoan(mockBook);

    await Promise.resolve();

    expect(service.loans()).toEqual([]);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  // Returning loans

  it('should return a book', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    service.returnBook('loan-1');

    await vi.waitFor(() => {
      expect(service.loans()).toHaveLength(0);
    });

    expect(repositoryMock.saveAll).toHaveBeenCalledWith([]);
  });

  it('should update loanCount after returning a book', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    service.returnBook('loan-1');

    await vi.waitFor(() => {
      expect(service.loanCount()).toBe(0);
    });
  });

  it('should not save when returning an unknown loan ID', async () => {
    await waitForLoading();

    service.returnBook('unknown-loan');

    await Promise.resolve();

    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  it('should preserve loans if returning a book fails to save', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);

    service = createService();

    await waitForLoading();

    repositoryMock.saveAll.mockRejectedValue(
      new Error('Storage unavailable')
    );

    service.returnBook('loan-1');

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenCalledOnce();
    });

    expect(service.loans()).toEqual([mockLoan]);
  });

  it('should not return a book if initial loading failed', async () => {
    repositoryMock.getAll.mockRejectedValue(
      new Error('Storage unavailable')
    );

    service = createService();

    await waitForLoading();

    service.returnBook('loan-1');

    await Promise.resolve();

    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });
});
