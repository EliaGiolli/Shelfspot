
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
  } from 'vitest';
  
  import { FavoriteService } from './favorites.service';
  import { type Book } from '../../shared/types/book';
  
  describe('FavoriteService', () => {
    let service: FavoriteService;
    let storage: Map<string, string>;
  
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
  
    beforeEach(() => {
      storage = new Map<string, string>();
  
      const localStorageMock = {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, String(value));
        }),
        removeItem: vi.fn((key: string) => {
          storage.delete(key);
        }),
        clear: vi.fn(() => {
          storage.clear();
        }),
      };
  
      vi.stubGlobal('localStorage', localStorageMock);
  
      service = new FavoriteService();
    });
  
    afterEach(() => {
      vi.unstubAllGlobals();
    });
  
    it('should initialize with an empty favorites list', () => {
      expect(service.favorites()).toEqual([]);
    });
  
    it('should load saved favorites from localStorage', () => {
      storage.set('shelfspot_favs', JSON.stringify([mockBook]));
  
      service = new FavoriteService();
  
      expect(service.favorites()).toEqual([mockBook]);
    });
  
    it('should return an empty list when localStorage contains invalid JSON', () => {
      storage.set('shelfspot_favs', '{invalid json');
  
      service = new FavoriteService();
  
      expect(service.favorites()).toEqual([]);
    });
  
    it('should return an empty list when stored data is not an array', () => {
      storage.set(
        'shelfspot_favs',
        JSON.stringify({ book: mockBook })
      );
  
      service = new FavoriteService();
  
      expect(service.favorites()).toEqual([]);
    });
  
    it('should ignore invalid books when loading saved favorites', () => {
      const invalidBooks = [
        null,
        'invalid book',
        { id: 123, authors: [] },
        { id: 'book-2', authors: 'J.R.R. Tolkien' },
      ];
  
      storage.set(
        'shelfspot_favs',
        JSON.stringify([mockBook, ...invalidBooks])
      );
  
      service = new FavoriteService();
  
      expect(service.favorites()).toEqual([mockBook]);
    });
  
    it('should add a book to favorites', () => {
      service.toggleFavorite(mockBook);
  
      expect(service.favorites()).toEqual([mockBook]);
    });
  
    it('should persist added favorites in localStorage', () => {
      service.toggleFavorite(mockBook);
  
      expect(
        JSON.parse(storage.get('shelfspot_favs')!)
      ).toEqual([mockBook]);
    });
  
    it('should remove a book from favorites when toggled again', () => {
      service.toggleFavorite(mockBook);
      service.toggleFavorite(mockBook);
  
      expect(service.favorites()).toEqual([]);
    });
  
    it('should persist the removal of a favorite in localStorage', () => {
      service.toggleFavorite(mockBook);
      service.toggleFavorite(mockBook);
  
      expect(
        JSON.parse(storage.get('shelfspot_favs')!)
      ).toEqual([]);
    });
  
    it('should identify a book that is already a favorite', () => {
      service.toggleFavorite(mockBook);
  
      expect(service.isFavorite(mockBook)).toBe(true);
    });
  
    it('should identify a book that is not a favorite', () => {
      expect(service.isFavorite(mockBook)).toBe(false);
    });
  
    it('should identify favorites by book ID', () => {
      const anotherBook = {
        ...mockBook,
        title: 'A Different Title',
      };
  
      service.toggleFavorite(mockBook);
  
      expect(service.isFavorite(anotherBook)).toBe(true);
    });
  
    it('should expose favorites as a readonly signal', () => {
      expect(service.favorites).toBeDefined();
      expect(typeof service.favorites).toBe('function');
    });
  });
  