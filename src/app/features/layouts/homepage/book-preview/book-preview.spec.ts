import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NEVER, of, throwError } from 'rxjs';

import { BookPreview } from './book-preview';
import { HttpBookService } from '../../../../core/services/http-book.service';

import type { Book } from '../../../../shared/types/book';

describe('BookPreview', () => {
  let component: BookPreview;
  let fixture: ComponentFixture<BookPreview>;

  let bookService: {
    getBooksBySubject: ReturnType<typeof vi.fn>;
  };

  const getElement = <T extends Element>(selector: string): T => {
    const element = (
      fixture.nativeElement as HTMLElement
    ).querySelector(selector);

    if (!element) {
      throw new Error(`Element "${selector}" not found`);
    }

    return element as T;
  };

  const getElements = <T extends Element>(selector: string): T[] => {
    const elements = (
      fixture.nativeElement as HTMLElement
    ).querySelectorAll(selector) as NodeListOf<T>;

    return Array.from(elements);
  };

  const getCategoryButton = (category: string): HTMLButtonElement => {
    const button = getElements<HTMLButtonElement>(
      'nav[aria-label="Filter books by category"] app-button button',
    ).find(item => item.textContent?.trim() === category);

    if (!button) {
      throw new Error(`Category button "${category}" not found`);
    }

    return button;
  };

  const getPaginationButton = (
    label: 'Go to previous page' | 'Go to next page',
  ): HTMLButtonElement => {
    return getElement<HTMLButtonElement>(
      `nav[aria-label="Book recommendations pagination"] button[aria-label="${label}"]`,
    );
  };

  beforeEach(async () => {
    bookService = {
      getBooksBySubject: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [BookPreview],
      providers: [
        provideRouter([]),
        {
          provide: HttpBookService,
          useValue: bookService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with the default category selected', () => {
      const selectedButton = getCategoryButton('All');

      expect(selectedButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should initialize on the first page', () => {
      const currentPage = getElement<HTMLElement>(
        '[aria-current="page"]',
      );

      expect(currentPage.textContent?.trim()).toBe('1');
    });

    it('should load all book categories on initialization', () => {
      expect(bookService.getBooksBySubject).toHaveBeenCalledTimes(3);

      expect(bookService.getBooksBySubject).toHaveBeenNthCalledWith(
        1,
        'fiction',
        1,
      );

      expect(bookService.getBooksBySubject).toHaveBeenNthCalledWith(
        2,
        'science',
        1,
      );

      expect(bookService.getBooksBySubject).toHaveBeenNthCalledWith(
        3,
        'classics',
        1,
      );
    });
  });

  describe('Category filters', () => {
    it('should display all category filters', () => {
      const buttons = getElements<HTMLButtonElement>(
        'nav[aria-label="Filter books by category"] app-button button',
      );

      expect(buttons).toHaveLength(4);

      expect(
        buttons.map(button => button.textContent?.trim()),
      ).toEqual(['All', 'Narrative', 'Science', 'Classics']);
    });

    it('should expose the selected category through aria-pressed', () => {
      const buttons = getElements<HTMLButtonElement>(
        'nav[aria-label="Filter books by category"] app-button button',
      );

      const selectedButtons = buttons.filter(
        button => button.getAttribute('aria-pressed') === 'true',
      );

      expect(selectedButtons).toHaveLength(1);
      expect(selectedButtons[0].textContent?.trim()).toBe('All');
    });

    it('should select the Science category', () => {
      getCategoryButton('Science').click();
      fixture.detectChanges();

      expect(getCategoryButton('Science').getAttribute('aria-pressed')).toBe(
        'true',
      );

      expect(getCategoryButton('All').getAttribute('aria-pressed')).toBe(
        'false',
      );
    });

    it('should load books from the selected category', () => {
      getCategoryButton('Science').click();

      expect(bookService.getBooksBySubject).toHaveBeenLastCalledWith(
        'science',
        1,
      );
    });

    it('should not reload books when selecting the already active category', () => {
      const initialCalls = bookService.getBooksBySubject.mock.calls.length;

      getCategoryButton('All').click();

      expect(bookService.getBooksBySubject).toHaveBeenCalledTimes(
        initialCalls,
      );
    });

    it('should reset pagination when changing category', () => {
      getPaginationButton('Go to next page').click();
      fixture.detectChanges();

      getCategoryButton('Science').click();
      fixture.detectChanges();

      const currentPage = getElement<HTMLElement>(
        '[aria-current="page"]',
      );

      expect(currentPage.textContent?.trim()).toBe('1');

      expect(bookService.getBooksBySubject).toHaveBeenLastCalledWith(
        'science',
        1,
      );
    });

    it('should use buttons with type button for category filters', () => {
      const buttons = getElements<HTMLButtonElement>(
        'nav[aria-label="Filter books by category"] app-button button',
      );

      expect(buttons.every(button => button.type === 'button')).toBe(true);
    });
  });

  describe('Pagination', () => {
    it('should expose an accessible pagination navigation region', () => {
      const navigation = getElement<HTMLElement>(
        'nav[aria-label="Book recommendations pagination"]',
      );

      expect(navigation).toBeTruthy();
    });

    it('should disable the previous button on the first page', () => {
      const previousButton = getPaginationButton('Go to previous page');

      expect(previousButton.disabled).toBe(true);
    });

    it('should provide accessible labels for pagination buttons', () => {
      expect(
        getPaginationButton('Go to previous page').getAttribute('aria-label'),
      ).toBe('Go to previous page');

      expect(
        getPaginationButton('Go to next page').getAttribute('aria-label'),
      ).toBe('Go to next page');
    });

    it('should use buttons with type button for pagination', () => {
      expect(getPaginationButton('Go to previous page').type).toBe('button');
      expect(getPaginationButton('Go to next page').type).toBe('button');
    });

    it('should move to the next page', () => {
      getPaginationButton('Go to next page').click();
      fixture.detectChanges();

      const currentPage = getElement<HTMLElement>(
        '[aria-current="page"]',
      );

      expect(currentPage.textContent?.trim()).toBe('2');

      expect(bookService.getBooksBySubject).toHaveBeenLastCalledWith(
        'classics',
        2,
      );
    });

    it('should move back to the previous page', () => {
      getPaginationButton('Go to next page').click();
      fixture.detectChanges();

      getPaginationButton('Go to previous page').click();
      fixture.detectChanges();

      const currentPage = getElement<HTMLElement>(
        '[aria-current="page"]',
      );

      expect(currentPage.textContent?.trim()).toBe('1');

      expect(bookService.getBooksBySubject).toHaveBeenLastCalledWith(
        'classics',
        1,
      );
    });

    it('should not navigate to a page before the first one', () => {
      const initialCalls = bookService.getBooksBySubject.mock.calls.length;

      getPaginationButton('Go to previous page').click();

      expect(bookService.getBooksBySubject).toHaveBeenCalledTimes(
        initialCalls,
      );
    });

    it('should identify the current page accessibly', () => {
      const currentPage = getElement<HTMLElement>(
        '[aria-current="page"]',
      );

      expect(currentPage.tagName.toLowerCase()).toBe('span');
      expect(currentPage.textContent?.trim()).toBe('1');
    });
  });

  describe('Carousel accessibility', () => {
    it('should expose the book carousel as a named region', () => {
      const carousel = getElement<HTMLElement>(
        '[role="region"][aria-label="Book recommendations"]',
      );

      expect(carousel).toBeTruthy();
    });

    it('should make the carousel keyboard focusable', () => {
      const carousel = getElement<HTMLElement>(
        '[aria-label="Book recommendations"]',
      );

      expect(carousel.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Loading state', () => {
    it('should display the loading indicator while books are being fetched', () => {
      bookService.getBooksBySubject.mockReturnValue(NEVER);

      getCategoryButton('Science').click();
      fixture.detectChanges();

      const loadingIndicator = getElement<HTMLElement>(
        '[role="status"]',
      );

      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.getAttribute('aria-label')).toBe(
        'Loading books',
      );
    });

    it('should disable pagination while books are loading', () => {
      bookService.getBooksBySubject.mockReturnValue(NEVER);

      getCategoryButton('Science').click();
      fixture.detectChanges();

      expect(getPaginationButton('Go to next page').disabled).toBe(true);
      expect(getPaginationButton('Go to previous page').disabled).toBe(true);
    });
  });

  describe('Empty state', () => {
    it('should display a message when no books are available', () => {
      const emptyMessage = getElements<HTMLParagraphElement>(
        '[role="status"]',
      ).find(paragraph =>
        paragraph.textContent?.includes(
          'No books available in this category.',
        ),
      );

      expect(emptyMessage).toBeTruthy();
    });

    it('should hide the loading indicator after an empty response', () => {
      const loadingIndicator = (
        fixture.nativeElement as HTMLElement
      ).querySelector('[aria-label="Loading books"]');

      expect(loadingIndicator).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should stop loading when the API request fails', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      bookService.getBooksBySubject.mockReturnValue(
        throwError(() => new Error('API failure')),
      );

      getCategoryButton('Science').click();
      fixture.detectChanges();

      const loadingIndicator = (
        fixture.nativeElement as HTMLElement
      ).querySelector('[aria-label="Loading books"]');

      expect(loadingIndicator).toBeNull();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should display the empty state after an API error', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      bookService.getBooksBySubject.mockReturnValue(
        throwError(() => new Error('API failure')),
      );

      getCategoryButton('Science').click();
      fixture.detectChanges();

      const emptyMessage = getElements<HTMLParagraphElement>(
        '[role="status"]',
      ).find(paragraph =>
        paragraph.textContent?.includes(
          'No books available in this category.',
        ),
      );

      expect(emptyMessage).toBeTruthy();

      consoleError.mockRestore();
    });
  });

  describe('Navigation links', () => {
    it('should provide a link to the book search page', () => {
      const searchLink = getElement<HTMLElement>(
        'app-button-link[routerLink="/books/search"]',
      );

      expect(searchLink).toBeTruthy();
    });

    
    it('should provide accessible text for book detail links', () => {
      const mockBook: Book = {
        id: 'OL123W',
        key: '/works/OL123W',
        title: 'Dune',
        authors: ['Frank Herbert'],
        coverId: 123,
        firstPublishYear: 1965,
        subjects: ['Science Fiction'],
      };

      bookService.getBooksBySubject.mockReturnValue(of([mockBook]));

      getCategoryButton('Science').click();
      fixture.detectChanges();

      const detailLinks = getElements<HTMLAnchorElement>(
        'app-button-link a[aria-label^="View details for "]',
      );

      expect(detailLinks).toHaveLength(1);
      expect(detailLinks[0].getAttribute('aria-label')).toBe(
        'View details for Dune',
      );
    });
  });
});
