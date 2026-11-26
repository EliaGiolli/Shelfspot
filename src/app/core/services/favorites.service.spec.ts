
import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { FavoriteService } from './favorites.service';
import type { Book } from '../../shared/types/book';
import { FAVORITES_REPOSITORY } from '../../core/tokens/favorites-repository.token';

describe('FavoriteService', () => {
  let service: FavoriteService;

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

  function recreateService(): void {
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

    service = TestBed.inject(FavoriteService);
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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty favorites list', () => {
    expect(service.favorites()).toEqual([]);
  });

  it('should load saved favorites from the repository', async () => {
    repositoryMock.getAll.mockResolvedValue([mockBook]);

    recreateService();

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([mockBook]);
    });
  });

  it('should expose the loaded state', async () => {
    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });
  });

  it('should add a book to favorites', async () => {
    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([mockBook]);
    });
  });

  it('should persist added favorites through the repository', async () => {
    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenCalledWith([mockBook]);
    });
  });

  it('should remove a book from favorites when toggled again', async () => {
    service.toggleFavorite(mockBook);
    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([]);
    });
  });

  it('should persist the removal of a favorite', async () => {
    service.toggleFavorite(mockBook);
    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(repositoryMock.saveAll).toHaveBeenLastCalledWith([]);
    });
  });

  it('should identify a book that is already a favorite', async () => {
    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(service.isFavorite(mockBook)).toBe(true);
    });
  });

  it('should identify a book that is not a favorite', () => {
    expect(service.isFavorite(mockBook)).toBe(false);
  });

  it('should identify favorites by book ID', async () => {
    const anotherBook: Book = {
      ...mockBook,
      title: 'A Different Title',
    };

    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(service.isFavorite(anotherBook)).toBe(true);
    });
  });

  it('should expose favorites as a readonly signal', () => {
    expect(service.favorites).toBeDefined();
    expect(typeof service.favorites).toBe('function');
    expect('set' in service.favorites).toBe(false);
  });

  it('should handle repository loading errors', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    repositoryMock.getAll.mockRejectedValue(new Error('Storage error'));

    recreateService();

    await vi.waitFor(() => {
      expect(service.isLoaded()).toBe(true);
    });

    expect(service.favorites()).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });

  it('should handle repository saving errors', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    repositoryMock.saveAll.mockRejectedValue(new Error('Storage error'));

    service.toggleFavorite(mockBook);

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
  });

  it('should preserve the order of consecutive favorite operations', async () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      title: 'The Lord of the Rings',
    };

    service.toggleFavorite(mockBook);
    service.toggleFavorite(secondBook);

    await vi.waitFor(() => {
      expect(service.favorites()).toEqual([mockBook, secondBook]);
    });

    expect(repositoryMock.saveAll).toHaveBeenLastCalledWith([
      mockBook,
      secondBook,
    ]);
  });
});
