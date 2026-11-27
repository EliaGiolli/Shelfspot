
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { FavoriteService } from './favorites.service';
import { FAVORITES_REPOSITORY } from '../tokens/favorites-repository.token';
import type { FavoritesRepository } from '../../features/favorites/repository/favorites.repository';
import type { Book } from '../../shared/types/book';

describe('FavoriteService', () => {
  let service: FavoriteService;

  let repositoryMock: {
    getAll: ReturnType<typeof vi.fn>;
    saveAll: ReturnType<typeof vi.fn>;
  };

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/OL123W',
    title: 'Dune',
    authors: ['Frank Herbert'],
    coverId: 123,
    firstPublishYear: 1965,
    subjects: ['Science Fiction'],
  };

  const anotherBook: Book = {
    id: 'book-2',
    key: '/works/OL456W',
    title: 'Foundation',
    authors: ['Isaac Asimov'],
    coverId: 456,
    firstPublishYear: 1951,
    subjects: ['Science Fiction'],
  };

  const createService = (): FavoriteService => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        FavoriteService,
        {
          provide: FAVORITES_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    });

    return TestBed.inject(FavoriteService);
  };

  beforeEach(() => {
    repositoryMock = {
      getAll: vi.fn().mockResolvedValue([]),
      saveAll: vi.fn().mockResolvedValue(undefined),
    };

    service = createService();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with an empty favorites list', () => {
      expect(service.favorites()).toEqual([]);
    });

    it('should initialize with isLoaded set to false', () => {
      repositoryMock.getAll.mockReturnValue(
        new Promise<Book[]>(() => {}),
      );

      service = createService();

      expect(service.isLoaded()).toBe(false);
    });

    it('should load favorites from the repository', async () => {
      repositoryMock.getAll.mockResolvedValue([mockBook]);

      vi.clearAllMocks();
      service = createService();

      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      expect(service.favorites()).toEqual([mockBook]);
      expect(repositoryMock.getAll).toHaveBeenCalledOnce();
    });

    it('should set isLoaded to true after loading completes', async () => {
      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });
    });

    it('should expose no load error after successful loading', async () => {
      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      expect(service.loadError()).toBeNull();
    });

    it('should expose a load error when repository loading fails', async () => {
      repositoryMock.getAll.mockRejectedValue(
        new Error('Storage unavailable'),
      );

      service = createService();

      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      expect(service.favorites()).toEqual([]);
      expect(service.loadError()).toBe(
        'Unable to load your favorites. Please try again.',
      );
    });

    it('should not expose a load error before loading completes', () => {
      expect(service.loadError()).toBeNull();
    });
  });

  describe('isFavorite()', () => {
    it('should return true when a book is in favorites', async () => {
      repositoryMock.getAll.mockResolvedValue([mockBook]);

      service = createService();

      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      expect(service.isFavorite(mockBook)).toBe(true);
    });

    it('should return false when a book is not in favorites', () => {
      expect(service.isFavorite(mockBook)).toBe(false);
    });
  });

  describe('toggleFavorite()', () => {
    it('should add a book to favorites', async () => {
      const result = await service.toggleFavorite(mockBook);

      expect(result).toBe(true);
      expect(service.favorites()).toEqual([mockBook]);
      expect(service.isFavorite(mockBook)).toBe(true);
    });

    it('should persist the updated favorites when adding a book', async () => {
      await service.toggleFavorite(mockBook);

      expect(repositoryMock.saveAll).toHaveBeenCalledWith([mockBook]);
    });

    it('should remove a book from favorites when it already exists', async () => {
      repositoryMock.getAll.mockResolvedValue([mockBook]);

      service = createService();

      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      const result = await service.toggleFavorite(mockBook);

      expect(result).toBe(true);
      expect(service.favorites()).toEqual([]);
      expect(service.isFavorite(mockBook)).toBe(false);
    });

    it('should preserve other favorites when removing a book', async () => {
      repositoryMock.getAll.mockResolvedValue([
        mockBook,
        anotherBook,
      ]);

      service = createService();

      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      await service.toggleFavorite(mockBook);

      expect(service.favorites()).toEqual([anotherBook]);
    });

    it('should expose a success message when adding a favorite', async () => {
      await service.toggleFavorite(mockBook);

      expect(service.favoriteActionStatus()).toBe('success');
      expect(service.favoriteActionMessage()).toBe(
        'Added to favorites.',
      );
    });

    it('should expose a success message when removing a favorite', async () => {
      repositoryMock.getAll.mockResolvedValue([mockBook]);

      service = createService();

      await vi.waitFor(() => {
        expect(service.isLoaded()).toBe(true);
      });

      await service.toggleFavorite(mockBook);

      expect(service.favoriteActionStatus()).toBe('success');
      expect(service.favoriteActionMessage()).toBe(
        'Removed from favorites.',
      );
    });

    it('should not update favorites when persistence fails', async () => {
      repositoryMock.saveAll.mockRejectedValue(
        new Error('Storage unavailable'),
      );

      const result = await service.toggleFavorite(mockBook);

      expect(result).toBe(false);
      expect(service.favorites()).toEqual([]);
      expect(service.isFavorite(mockBook)).toBe(false);
    });

    it('should expose an error message when persistence fails', async () => {
      repositoryMock.saveAll.mockRejectedValue(
        new Error('Storage unavailable'),
      );

      await service.toggleFavorite(mockBook);

      expect(service.favoriteActionStatus()).toBe('error');
      expect(service.favoriteActionMessage()).toBe(
        'Unable to update favorites. Please try again.',
      );
    });

    it('should clear the previous action feedback before a new operation', async () => {
      await service.toggleFavorite(mockBook);

      expect(service.favoriteActionStatus()).toBe('success');

      await service.toggleFavorite(anotherBook);

      expect(service.favoriteActionStatus()).toBe('success');
      expect(service.favoriteActionMessage()).toBe(
        'Added to favorites.',
      );
    });
  });
});
