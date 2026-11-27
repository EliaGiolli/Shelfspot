
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type Signal } from '@angular/core';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { FavoritePage } from './favorite-page';
import { FavoriteService } from '../../../core/services/favorites.service';
import type { Book } from '../../../shared/types/book';

describe('FavoritePage', () => {
  let component: FavoritePage;
  let fixture: ComponentFixture<FavoritePage>;

  let favoritesSignal: ReturnType<typeof signal<Book[]>>;

  let favoriteServiceMock: {
    favorites: Signal<Book[]>;
    toggleFavorite: ReturnType<typeof vi.fn>;
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

  const secondBook: Book = {
    id: 'book-2',
    key: '/works/book-2',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    subjects: ['Classic literature'],
    coverId: 456,
    firstPublishYear: 1813,
  };

  beforeEach(async () => {
    favoritesSignal = signal<Book[]>([]);

    favoriteServiceMock = {
      favorites: favoritesSignal.asReadonly(),
      toggleFavorite: vi.fn().mockResolvedValue(true),
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Page heading', () => {
    it('should display the library heading', () => {
      const heading: HTMLElement | null =
        fixture.nativeElement.querySelector('h1');

      expect(heading?.textContent).toContain('Your');
      expect(heading?.textContent).toContain('Library');
    });

    it('should display the collection description', () => {
      expect(fixture.nativeElement.textContent).toContain(
        'Your favorite books, all in one place.'
      );
    });
  });

  describe('Empty state', () => {
    it('should display an empty state when there are no favorites', () => {
      expect(fixture.nativeElement.textContent).toContain(
        'Your collection is empty'
      );
    });

    it('should display guidance for discovering books', () => {
      expect(fixture.nativeElement.textContent).toContain(
        'Explore the catalog and save the books you love.'
      );
    });

    it('should not render book cards when favorites are empty', () => {
      const cards = fixture.nativeElement.querySelectorAll('app-card');

      expect(cards.length).toBe(0);
    });
  });

  describe('Favorites rendering', () => {
    beforeEach(() => {
      favoritesSignal.set([mockBook, secondBook]);
      fixture.detectChanges();
    });

    it('should render a card for each favorite book', () => {
      const cards = fixture.nativeElement.querySelectorAll('app-card');

      expect(cards.length).toBe(2);
    });

    it('should display book titles', () => {
      const text = fixture.nativeElement.textContent;

      expect(text).toContain('The Hobbit');
      expect(text).toContain('Pride and Prejudice');
    });

    it('should display book authors', () => {
      const text = fixture.nativeElement.textContent;

      expect(text).toContain('J.R.R. Tolkien');
      expect(text).toContain('Jane Austen');
    });

    it('should display publication years when available', () => {
      const text = fixture.nativeElement.textContent;

      expect(text).toContain('1937');
      expect(text).toContain('1813');
    });

    it('should display the unknown author fallback when authors are missing', () => {
      favoritesSignal.set([
        {
          ...mockBook,
          authors: [],
        },
      ]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        'Unknown Author'
      );
    });

    it('should render book covers with descriptive alt text', () => {
      const images: NodeListOf<HTMLImageElement> =
        fixture.nativeElement.querySelectorAll(
          'img[alt^="Cover of"]'
        );

      expect(images.length).toBe(2);
      expect(images[0].alt).toBe('Cover of The Hobbit');
      expect(images[1].alt).toBe('Cover of Pride and Prejudice');
    });

    it('should lazy-load book cover images', () => {
      const images: NodeListOf<HTMLImageElement> =
        fixture.nativeElement.querySelectorAll(
          'img[alt^="Cover of"]'
        );

      expect(images.length).toBe(2);

      images.forEach(image => {
        expect(image.getAttribute('loading')).toBe('lazy');
      });
    });

    it('should associate each card with its book title', () => {
      const card: HTMLElement =
        fixture.nativeElement.querySelector('app-card');

      const article: HTMLElement | null =
        card.querySelector('article');

      const titleId = article?.getAttribute('aria-labelledby');

      expect(titleId).toBe('favorite-title-book-1');

      const title = fixture.nativeElement.querySelector(
        `#${titleId}`
      );

      expect(title?.textContent).toContain('The Hobbit');
    });
  });

  describe('Favorite removal', () => {
    beforeEach(() => {
      favoritesSignal.set([mockBook]);
      fixture.detectChanges();
    });

    it('should display a remove favorite button', () => {
      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector(
          'button[aria-label="Remove The Hobbit from favorites"]'
        );

      expect(button).toBeTruthy();
    });

    it('should call toggleFavorite with the selected book', () => {
      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector(
          'button[aria-label="Remove The Hobbit from favorites"]'
        );

      button.click();

      expect(favoriteServiceMock.toggleFavorite)
        .toHaveBeenCalledWith(mockBook);
    });

    it('should not display remove buttons when there are no favorites', () => {
      favoritesSignal.set([]);
      fixture.detectChanges();

      const buttons =
        fixture.nativeElement.querySelectorAll(
          'button[aria-label^="Remove"]'
        );

      expect(buttons.length).toBe(0);
    });
  });

  describe('Reactive updates', () => {
    it('should update the displayed cards when favorites change', () => {
      favoritesSignal.set([mockBook]);
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelectorAll('app-card').length
      ).toBe(1);

      favoritesSignal.set([mockBook, secondBook]);
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelectorAll('app-card').length
      ).toBe(2);
    });

    it('should display the empty state after all favorites are removed', () => {
      favoritesSignal.set([mockBook]);
      fixture.detectChanges();

      favoritesSignal.set([]);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        'Your collection is empty'
      );
    });
  });
});
