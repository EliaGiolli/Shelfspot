
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { LoanService } from './loans.service';
import { LOANS_REPOSITORY } from '../tokens/loans-repository,token';

import { AppError } from '../errors/app-error';

import type { Book } from '../../shared/types/book';
import type { Loan } from '../../shared/types/loans.types';
import type { LoansRepository } from '../../features/loans/repository/loans.repository';

describe('LoanService', () => {
  let service: LoanService;
  let repositoryMock: {
    getAll: ReturnType<typeof vi.fn>;
    saveAll: ReturnType<typeof vi.fn>;
  };

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/book-1',
    title: 'Test Book',
    authors: ['Test Author'],
    subjects: []
  };

  const mockLoan: Loan = {
    id: 'loan-1',
    book: mockBook,
    loanDate: new Date('2026-01-01T10:00:00.000Z'),
    dueDate: new Date('2026-01-31T10:00:00.000Z')
  };

  function createService(): LoanService {
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
  }

  beforeEach(() => {
    repositoryMock = {
      getAll: vi.fn().mockResolvedValue([]),
      saveAll: vi.fn().mockResolvedValue(undefined)
    };

    service = createService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty loans list', async () => {
    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });

    expect(service.loans()).toEqual([]);
  });

  it('should load loans from the repository', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([mockLoan]);
    });

    expect(repositoryMock.getAll).toHaveBeenCalledOnce();
  });

  it('should update loanCount after loading', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.loanCount()).toBe(1);
    });
  });

  it('should handle repository loading errors', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    expect(service.loans()).toEqual([]);
    expect(service.isLoaded()).toBe(true);
  });

  it('should retry loading loans', async () => {
    repositoryMock.getAll
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce([mockLoan]);

    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    await service.retryLoad();

    expect(service.loadError()).toBeNull();
    expect(service.loans()).toEqual([mockLoan]);
    expect(repositoryMock.getAll).toHaveBeenCalledTimes(2);
  });

  it('should expose an AppError message when loading fails', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    expect(service.loadError()).toBe(
      'Unable to load your loans. Please try again.'
    );
  });

  it('should add a new loan', async () => {
    const result = await service.addLoan(mockBook);

    expect(result).toBe(true);
    expect(service.loans()).toHaveLength(1);
    expect(service.loans()[0].book).toEqual(mockBook);
    expect(repositoryMock.saveAll).toHaveBeenCalledOnce();
  });

  it('should set the due date 30 calendar days after the loan date', async () => {
    await service.addLoan(mockBook);

    const loan = service.loans()[0];
    const expectedDate = new Date(loan.loanDate);
    expectedDate.setDate(expectedDate.getDate() + 30);

    expect(loan.dueDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should not add a duplicate loan', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([mockLoan]);
    });

    const result = await service.addLoan(mockBook);

    expect(result).toBe(true);
    expect(service.loans()).toHaveLength(1);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  it('should expose whether a book is borrowed', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.isBorrowed(mockBook.id)).toBe(true);
    });

    expect(service.isBorrowed('another-book')).toBe(false);
  });

  it('should update loanCount after adding a loan', async () => {
    await service.addLoan(mockBook);

    expect(service.loanCount()).toBe(1);
  });

  it('should expose a success message after adding a loan', async () => {
    await service.addLoan(mockBook);

    expect(service.actionStatus()).toBe('success');
    expect(service.actionMessage()).toBe(
      'Test Book has been added to your loans.'
    );
  });

  
  it('should expose loading status while saving a loan', async () => {
    let resolveSave!: () => void;

    repositoryMock.saveAll.mockImplementation(
      () => new Promise<void>(resolve => {
        resolveSave = resolve;
      })
    );

    const operation = service.addLoan(mockBook);

    await vi.waitFor(() => {
      expect(resolveSave).toBeTypeOf('function');
    });

    expect(service.actionStatus()).toBe('loading');

    resolveSave();
    await operation;

    expect(service.actionStatus()).toBe('success');
  });


  it('should expose a structured AppError when adding a loan fails', async () => {
    repositoryMock.saveAll.mockRejectedValue(new Error('Save failure'));

    await service.addLoan(mockBook);

    expect(service.actionError()).toBeInstanceOf(AppError);
    expect(service.actionError()?.type).toBe('storage');
    expect(service.actionError()?.originalError).toBeInstanceOf(Error);
  });

  it('should not add a loan if initial loading failed', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    const result = await service.addLoan(mockBook);

    expect(result).toBe(false);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  it('should return a book', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([mockLoan]);
    });

    const result = await service.returnBook(mockLoan.id);

    expect(result).toBe(true);
    expect(service.loans()).toEqual([]);
    expect(repositoryMock.saveAll).toHaveBeenCalledWith([]);
  });

  it('should expose a success message after returning a book', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([mockLoan]);
    });

    await service.returnBook(mockLoan.id);

    expect(service.actionStatus()).toBe('success');
    expect(service.actionMessage()).toBe(
      'Test Book has been successfully returned.'
    );
  });

  it('should not save when returning an unknown loan ID', async () => {
    const result = await service.returnBook('unknown-loan');

    expect(result).toBe(true);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  it('should preserve loans if returning a book fails to save', async () => {
    repositoryMock.getAll.mockResolvedValue([mockLoan]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.loans()).toEqual([mockLoan]);
    });

    repositoryMock.saveAll.mockRejectedValue(new Error('Save failure'));

    const result = await service.returnBook(mockLoan.id);

    expect(result).toBe(false);
    expect(service.loans()).toEqual([mockLoan]);
    expect(service.actionStatus()).toBe('error');
    expect(service.actionError()).toBeInstanceOf(AppError);
  });

  it('should not return a book if initial loading failed', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    const result = await service.returnBook(mockLoan.id);

    expect(result).toBe(false);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
  });

  it('should clear previous action errors after a successful operation', async () => {
    repositoryMock.saveAll.mockRejectedValueOnce(new Error('Save failure'));

    await service.addLoan(mockBook);

    expect(service.actionError()).toBeInstanceOf(AppError);

    repositoryMock.saveAll.mockResolvedValue(undefined);

    await service.addLoan({
      ...mockBook,
      id: 'book-2',
      key: '/works/book-2',
      title: 'Second Book'
    });

    expect(service.actionError()).toBeNull();
    expect(service.actionStatus()).toBe('success');
  });
});
