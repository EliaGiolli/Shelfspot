
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NEVER, of, throwError } from 'rxjs';

import { BookPreview } from './book-preview';
import { HttpBookService } from '../../../../core/services/http-book.service';

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
    const button = getElements<HTMLButtonElement>('nav button').find(
      item => item.textContent?.trim() === category,
    );

    if (!button) {
      throw new Error(`Category button "${category}" not found`);
    }

    return button;
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

    it('should initialize with the default category', () => {
      const selectedButton = getElement<HTMLButtonElement>(
        'nav button.btn-primary',
      );

      expect(selectedButton.textContent?.trim()).toBe('All');
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
      const buttons = getElements<HTMLButtonElement>('nav button');

      expect(buttons).toHaveLength(4);

      expect(
        buttons.map(button => button.textContent?.trim()),
      ).toEqual(['All', 'Narrative', 'Science', 'Classics']);
    });

    it('should select the Science category', () => {
      const scienceButton = getCategoryButton('Science');

      scienceButton.click();
      fixture.detectChanges();

      expect(scienceButton.classList.contains('btn-primary')).toBe(true);
      expect(scienceButton.classList.contains('btn-outline')).toBe(false);
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
      getElement<HTMLButtonElement>(
        'button[aria-label="Next page"]',
      ).click();

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
  });

  describe('Pagination', () => {
    it('should disable the previous button on the first page', () => {
      const previousButton = getElement<HTMLButtonElement>(
        'button[aria-label="Previous page"]',
      );

      expect(previousButton.disabled).toBe(true);
    });

    it('should move to the next page', () => {
      getElement<HTMLButtonElement>(
        'button[aria-label="Next page"]',
      ).click();

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
      getElement<HTMLButtonElement>(
        'button[aria-label="Next page"]',
      ).click();

      fixture.detectChanges();

      getElement<HTMLButtonElement>(
        'button[aria-label="Previous page"]',
      ).click();

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

      getElement<HTMLButtonElement>(
        'button[aria-label="Previous page"]',
      ).click();

      expect(bookService.getBooksBySubject).toHaveBeenCalledTimes(
        initialCalls,
      );
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
    });

    it('should disable pagination while books are loading', () => {
      bookService.getBooksBySubject.mockReturnValue(NEVER);

      getCategoryButton('Science').click();
      fixture.detectChanges();

      const nextButton = getElement<HTMLButtonElement>(
        'button[aria-label="Next page"]',
      );

      expect(nextButton.disabled).toBe(true);
    });
  });

  describe('Empty state', () => {
    it('should display a message when no books are available', () => {
      const emptyMessage = getElements<HTMLParagraphElement>('p').find(
        paragraph =>
          paragraph.textContent?.includes(
            'No books available in this category.',
          ),
      );

      expect(emptyMessage).toBeTruthy();
    });

    it('should hide the loading indicator after an empty response', () => {
      const loadingIndicator = (
        fixture.nativeElement as HTMLElement
      ).querySelector('[role="status"]');

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
      ).querySelector('[role="status"]');

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

      const emptyMessage = getElements<HTMLParagraphElement>('p').find(
        paragraph =>
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
  });
});
