
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { FavoritePage } from './favorite-page';
import { FavoriteService } from '../../../core/services/favorites.service';
import type { Book } from '../../../shared/types/book';

describe('FavoritePage', () => {
  let component: FavoritePage;
  let fixture: ComponentFixture<FavoritePage>;

  let favoritesSignal: ReturnType<typeof signal<Book[]>>;
  let isLoadedSignal: ReturnType<typeof signal<boolean>>;
  let loadErrorSignal: ReturnType<typeof signal<string | null>>;

  let favoriteServiceMock: {
    favorites: ReturnType<typeof favoritesSignal.asReadonly>;
    isLoaded: ReturnType<typeof isLoadedSignal.asReadonly>;
    loadError: ReturnType<typeof loadErrorSignal.asReadonly>;
    toggleFavorite: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    favoritesSignal = signal<Book[]>([]);
    isLoadedSignal = signal(true);
    loadErrorSignal = signal<string | null>(null);

    favoriteServiceMock = {
      favorites: favoritesSignal.asReadonly(),
      isLoaded: isLoadedSignal.asReadonly(),
      loadError: loadErrorSignal.asReadonly(),
      toggleFavorite: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FavoritePage],
      providers: [
        {
          provide: FavoriteService,
          useValue: favoriteServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritePage);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading state', () => {
    it('should display loading state while favorites are loading', () => {
      isLoadedSignal.set(false);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('Loading your favorites...');
    });

    it('should not display the empty state while loading', () => {
      isLoadedSignal.set(false);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .not.toContain('Your collection is empty');
    });

    it('should display a loading spinner', () => {
      isLoadedSignal.set(false);

      fixture.detectChanges();

      const spinner: HTMLElement | null =
        fixture.nativeElement.querySelector('.loading-spinner');

      expect(spinner).not.toBeNull();
    });
  });

  describe('error state', () => {
    it('should display an error when favorites cannot be loaded', () => {
      loadErrorSignal.set(
        'Unable to load your favorites. Please try again.',
      );

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('Unable to load your favorites');
    });

    it('should display the actual loading error message', () => {
      loadErrorSignal.set('Storage unavailable');

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('Storage unavailable');
    });

    it('should expose the error through an alert role', () => {
      loadErrorSignal.set('Storage unavailable');

      fixture.detectChanges();

      const alert: HTMLElement | null =
        fixture.nativeElement.querySelector('[role="alert"]');

      expect(alert).not.toBeNull();
    });

    it('should not display the empty state when loading fails', () => {
      loadErrorSignal.set('Storage unavailable');

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .not.toContain('Your collection is empty');
    });
  });

  describe('empty state', () => {
    it('should display the empty state when there are no favorites', () => {
      favoritesSignal.set([]);
      isLoadedSignal.set(true);
      loadErrorSignal.set(null);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('Your collection is empty');
    });

    it('should display the empty state description', () => {
      favoritesSignal.set([]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('You haven\'t added any favorites yet.');
    });

    it('should display the book icon in the empty state', () => {
      favoritesSignal.set([]);

      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector(
        'h2',
      );

      expect(emptyState?.textContent)
        .toContain('Your collection is empty');
    });
  });

  describe('favorites grid', () => {
    it('should display favorite books', () => {
      favoritesSignal.set([mockBook]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Dune');
      expect(fixture.nativeElement.textContent)
        .toContain('Frank Herbert');
    });

    it('should display multiple favorite books', () => {
      favoritesSignal.set([mockBook, anotherBook]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Dune');
      expect(fixture.nativeElement.textContent)
        .toContain('Foundation');
    });

    it('should display book covers with descriptive alt text', () => {
      favoritesSignal.set([mockBook, anotherBook]);

      fixture.detectChanges();

      const covers: NodeListOf<HTMLImageElement> =
        fixture.nativeElement.querySelectorAll(
          'img[alt^="Cover of"]',
        );

      expect(covers.length).toBe(2);
      expect(covers[0].alt).toBe('Cover of Dune');
      expect(covers[1].alt).toBe('Cover of Foundation');
    });

    it('should lazy-load book cover images', () => {
      favoritesSignal.set([mockBook]);

      fixture.detectChanges();

      const cover: HTMLImageElement | null =
        fixture.nativeElement.querySelector(
          'img[alt^="Cover of"]',
        );

      expect(cover?.getAttribute('loading')).toBe('lazy');
    });

    it('should display the publication year when available', () => {
      favoritesSignal.set([mockBook]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('1965');
    });

    it('should not display a publication year when unavailable', () => {
      const bookWithoutYear: Book = {
        ...mockBook,
        firstPublishYear: undefined,
      };

      favoritesSignal.set([bookWithoutYear]);

      fixture.detectChanges();

      const yearElements: NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll(
          '.uppercase.tracking-wider',
        );

      expect(yearElements.length).toBe(0);
    });

    it('should display Unknown Author when a book has no authors', () => {
      const bookWithoutAuthors: Book = {
        ...mockBook,
        authors: [],
      };

      favoritesSignal.set([bookWithoutAuthors]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('Unknown Author');
    });
  });

  describe('favorite actions', () => {
    it('should display a remove favorite button for each book', () => {
      favoritesSignal.set([mockBook, anotherBook]);

      fixture.detectChanges();

      const buttons: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('app-button button');

      expect(buttons.length).toBe(2);
    });

    it('should provide an accessible label for the remove button', () => {
      favoritesSignal.set([mockBook]);

      fixture.detectChanges();

      const button: HTMLButtonElement | null =
        fixture.nativeElement.querySelector('app-button button');

      expect(button?.getAttribute('aria-label'))
        .toBe('Remove Dune from favorites');
    });

    it('should call toggleFavorite when the remove button is clicked', () => {
      favoritesSignal.set([mockBook]);

      fixture.detectChanges();

      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector('app-button button');

      button.click();

      expect(favoriteServiceMock.toggleFavorite)
        .toHaveBeenCalledWith(mockBook);
    });
  });

  describe('page heading', () => {
    it('should display the page title', () => {
      expect(fixture.nativeElement.textContent)
        .toContain('Library');
    });

    it('should display the page description', () => {
      expect(fixture.nativeElement.textContent)
        .toContain('Your favorite books, all in one place.');
    });
  });
});
