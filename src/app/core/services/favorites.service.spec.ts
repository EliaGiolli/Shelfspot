
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { FavoriteService } from './favorites.service';
import { FAVORITES_REPOSITORY } from '../tokens/favorites-repository.token';

import { AppError } from '../errors/app-error';

import type { Book } from '../../shared/types/book';

describe('FavoriteService', () => {
  let service: FavoriteService;

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

  function createService(): FavoriteService {
    repositoryMock.getAll.mockClear();
    repositoryMock.saveAll.mockClear();

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        FavoriteService,
        {
          provide: FAVORITES_REPOSITORY,
          useValue: repositoryMock
        }
      ]
    });

    return TestBed.inject(FavoriteService);
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

  it('should initialize with an empty favorites list', async () => {
    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([]);
    });
  });

  it('should load favorites from the repository', async () => {
    repositoryMock.getAll.mockResolvedValue([mockBook]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([mockBook]);
    });

    expect(repositoryMock.getAll).toHaveBeenCalledOnce();
  });

  it('should expose isLoaded after initialization', async () => {
    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });
  });

  it('should handle repository loading errors', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    expect(service.favorites()).toEqual([]);
    expect(service.isLoaded()).toBe(true);
  });

  it('should not update favorites if initial loading failed', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    const result = await service.toggleFavorite(mockBook);

    expect(result).toBe(false);
    expect(service.favorites()).toEqual([]);
    expect(repositoryMock.saveAll).not.toHaveBeenCalled();
    expect(service.favoriteActionStatus()).toBe('error');
  });

  it('should expose an AppError when loading fails', async () => {
    repositoryMock.getAll.mockRejectedValue(new Error('Storage failure'));
    service = createService();

    await vi.waitFor(() => {
      expect(service.loadError()).not.toBeNull();
    });

    expect(service.loadError()).toBe(
      'Unable to load your favorites. Please try again.'
    );
  });

  it('should add a book to favorites', async () => {
    const result = await service.toggleFavorite(mockBook);

    expect(result).toBe(true);
    expect(service.favorites()).toEqual([mockBook]);
    expect(service.isFavorite(mockBook)).toBe(true);
    expect(repositoryMock.saveAll).toHaveBeenCalledWith([mockBook]);
  });

  it('should remove a book from favorites', async () => {
    repositoryMock.getAll.mockResolvedValue([mockBook]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([mockBook]);
    });

    const result = await service.toggleFavorite(mockBook);

    expect(result).toBe(true);
    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite(mockBook)).toBe(false);
    expect(repositoryMock.saveAll).toHaveBeenCalledWith([]);
  });

  it('should expose a success message when adding a favorite', async () => {
    await service.toggleFavorite(mockBook);

    expect(service.favoriteActionStatus()).toBe('success');
    expect(service.favoriteActionMessage()).toBe(
      'Test Book has been added to favorites.'
    );
  });

  it('should expose a success message when removing a favorite', async () => {
    repositoryMock.getAll.mockResolvedValue([mockBook]);
    service = createService();

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([mockBook]);
    });

    await service.toggleFavorite(mockBook);

    expect(service.favoriteActionStatus()).toBe('success');
    expect(service.favoriteActionMessage()).toBe(
      'Test Book has been removed from favorites.'
    );
  });

  it('should expose loading status while saving', async () => {
    let resolveSave!: () => void;

    repositoryMock.saveAll.mockImplementation(
      () => new Promise<void>(resolve => {
        resolveSave = resolve;
      })
    );

    const operation = service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(resolveSave).toBeTypeOf('function');
    });

    expect(service.favoriteActionStatus()).toBe('loading');

    resolveSave();
    await operation;

    expect(service.favoriteActionStatus()).toBe('success');
  });

  it('should handle save errors without updating favorites', async () => {
    repositoryMock.saveAll.mockRejectedValue(new Error('Save failure'));

    const result = await service.toggleFavorite(mockBook);

    expect(result).toBe(false);
    expect(service.favorites()).toEqual([]);
    expect(service.favoriteActionStatus()).toBe('error');
    expect(service.favoriteActionMessage()).toBe(
      'Unable to update favorites. Please try again.'
    );
  });

  it('should expose a structured AppError when saving fails', async () => {
    repositoryMock.saveAll.mockRejectedValue(new Error('Save failure'));

    await service.toggleFavorite(mockBook);

    expect(service.favoriteActionError()).toBeInstanceOf(AppError);
    expect(service.favoriteActionError()?.type).toBe('storage');
    expect(service.favoriteActionError()?.originalError).toBeInstanceOf(Error);
  });

  it('should clear previous action errors before a new operation', async () => {
    repositoryMock.saveAll.mockRejectedValueOnce(new Error('Save failure'));

    await service.toggleFavorite(mockBook);

    expect(service.favoriteActionError()).toBeInstanceOf(AppError);

    repositoryMock.saveAll.mockResolvedValue(undefined);

    await service.toggleFavorite(mockBook);

    expect(service.favoriteActionError()).toBeNull();
    expect(service.favoriteActionStatus()).toBe('success');
  });

  it('should serialize concurrent favorite operations', async () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      key: '/works/book-2',
      title: 'Second Book'
    };

    await Promise.all([
      service.toggleFavorite(mockBook),
      service.toggleFavorite(secondBook)
    ]);

    expect(service.favorites()).toEqual([mockBook, secondBook]);
    expect(repositoryMock.saveAll).toHaveBeenCalledTimes(2);
  });

  it('should expose favorites as a readonly signal', () => {
    expect(service.favorites()).toEqual([]);
    expect('set' in service.favorites()).toBe(false);
  });
});
