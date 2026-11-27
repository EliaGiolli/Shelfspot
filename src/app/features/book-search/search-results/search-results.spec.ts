
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SearchResults } from './search-results';

import type { Book, BookSearchResponse } from '../../../shared/types/book';
import type { ApiState } from '../../../shared/types/api-state';

describe('SearchResults', () => {
  let component: SearchResults;
  let fixture: ComponentFixture<SearchResults>;

  const mockBooks: Book[] = [
    {
      id: '1',
      key: '/works/OL1W',
      title: 'Dune',
      authors: ['Frank Herbert'],
      coverId: 123,
      firstPublishYear: 1965,
      subjects: ['Science Fiction']
    },
    {
      id: '2',
      key: '/works/OL2W',
      title: 'Foundation',
      authors: ['Isaac Asimov'],
      firstPublishYear: 1951,
      subjects: ['Science Fiction']
    }
  ];

  const mockResponse: BookSearchResponse = {
    books: mockBooks,
    totalFound: 24,
    page: 1
  };

  function setInputs(
    state: ApiState<BookSearchResponse>,
    books: Book[] = [],
    page = 1,
    hasNextPage = false
  ): void {
    fixture.componentRef.setInput('apiState', state);
    fixture.componentRef.setInput('books', books);
    fixture.componentRef.setInput('currentPage', page);
    fixture.componentRef.setInput('hasNextPage', hasNextPage);

    fixture.detectChanges();
  }

  function getPaginationButtons(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'nav[aria-label="Search results pagination"] app-button button'
      )
    );
  }

  function getDetailsButtons(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-card app-button button'
      )
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResults]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResults);
    component = fixture.componentInstance;

    setInputs({ status: 'idle' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('results rendering', () => {
    it('should display the books received through input', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks
      );

      const content = fixture.nativeElement.textContent;

      expect(content).toContain('Dune');
      expect(content).toContain('Foundation');
    });

    it('should display book authors', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks
      );

      const content = fixture.nativeElement.textContent;

      expect(content).toContain('Frank Herbert');
      expect(content).toContain('Isaac Asimov');
    });

    it('should display Unknown Author when a book has no authors', () => {
      const bookWithoutAuthor: Book = {
        ...mockBooks[0],
        authors: []
      };

      setInputs(
        {
          status: 'success',
          data: {
            ...mockResponse,
            books: [bookWithoutAuthor]
          }
        },
        [bookWithoutAuthor]
      );

      expect(fixture.nativeElement.textContent).toContain('Unknown Author');
    });

    it('should render a details button for each book', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks
      );

      const buttons = getDetailsButtons();

      expect(buttons).toHaveLength(2);
      expect(buttons.every(button =>
        button.textContent?.includes('View Details')
      )).toBe(true);
    });

    it('should display the correct cover alt text', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks
      );

      const images: HTMLImageElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('img')
      );

      expect(images[0].alt).toBe('Cover of Dune');
      expect(images[1].alt).toBe('Cover of Foundation');
    });
  });

  describe('API states', () => {
    it('should display an error message when the API state is error', () => {
      setInputs({
        status: 'error',
        error: 'Network error'
      });

      const content = fixture.nativeElement.textContent;

      expect(content).toContain('Something went wrong.');
      expect(content).toContain('Network error');
    });

    it('should display an accessible alert when the API state is error', () => {
      setInputs({
        status: 'error',
        error: 'Network error'
      });

      const alert = fixture.nativeElement.querySelector('[role="alert"]');

      expect(alert).toBeTruthy();
    });

    it('should display a retry button when the API state is error', () => {
      setInputs({
        status: 'error',
        error: 'Network error'
      });

      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector('app-button button');

      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Retry Search');
      expect(button.getAttribute('aria-label')).toBe('Retry book search');
    });

    it('should display an empty state when no books are found', () => {
      setInputs({ status: 'empty' });

      expect(fixture.nativeElement.textContent).toContain(
        'No books found for your search.'
      );
    });

    it('should expose the empty state through a status announcement', () => {
      setInputs({ status: 'empty' });

      const status = fixture.nativeElement.querySelector('[role="status"]');

      expect(status).toBeTruthy();
      expect(status.textContent).toContain(
        'No books found for your search.'
      );
    });

    it('should not display results when the API state is idle', () => {
      setInputs({ status: 'idle' });

      expect(fixture.nativeElement.querySelector('app-card')).toBeNull();
    });

    it('should disable details buttons while loading', () => {
      setInputs(
        { status: 'loading' },
        mockBooks
      );

      const buttons = getDetailsButtons();

      expect(buttons).toHaveLength(2);
      expect(buttons.every(button => button.disabled)).toBe(true);
    });
  });

  describe('retry interaction', () => {
    it('should emit retry when the retry button is clicked', () => {
      const retrySpy = vi.fn();

      component.retry.subscribe(retrySpy);

      setInputs({
        status: 'error',
        error: 'Network error'
      });

      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector('app-button button');

      button.click();

      expect(retrySpy).toHaveBeenCalledOnce();
    });
  });

  describe('book details interaction', () => {
    it('should emit the selected book when its details button is clicked', () => {
      const detailsSpy = vi.fn();

      component.viewDetails.subscribe(detailsSpy);

      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks
      );

      const buttons = getDetailsButtons();

      buttons[0].click();

      expect(detailsSpy).toHaveBeenCalledOnce();
      expect(detailsSpy).toHaveBeenCalledWith(mockBooks[0]);
    });
  });

  describe('pagination', () => {
    it('should display the current page', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        2,
        true
      );

      const currentPage = fixture.nativeElement.querySelector(
        '[aria-current="page"]'
      );

      expect(currentPage).toBeTruthy();
      expect(currentPage.textContent.trim()).toBe('Current page: 2');
    });

    it('should disable previous page when on the first page', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        1,
        true
      );

      const buttons = getPaginationButtons();

      expect(buttons[0].disabled).toBe(true);
    });

    it('should disable next page when there are no more results', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        1,
        false
      );

      const buttons = getPaginationButtons();

      expect(buttons[1].disabled).toBe(true);
    });

    it('should enable next page when more results are available', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        1,
        true
      );

      const buttons = getPaginationButtons();

      expect(buttons[1].disabled).toBe(false);
    });

    it('should disable pagination while loading', () => {
      setInputs(
        { status: 'loading' },
        mockBooks,
        2,
        true
      );

      const buttons = getPaginationButtons();

      expect(buttons).toHaveLength(2);
      expect(buttons.every(button => button.disabled)).toBe(true);
    });

    it('should expose accessible labels for pagination buttons', () => {
      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        2,
        true
      );

      const buttons = getPaginationButtons();

      expect(buttons[0].getAttribute('aria-label')).toBe(
        'Go to previous page'
      );

      expect(buttons[1].getAttribute('aria-label')).toBe(
        'Go to next page'
      );
    });

    it('should emit previousPage when the previous button is clicked', () => {
      const previousSpy = vi.fn();

      component.previousPage.subscribe(previousSpy);

      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        2,
        true
      );

      const buttons = getPaginationButtons();

      buttons[0].click();

      expect(previousSpy).toHaveBeenCalledOnce();
    });

    it('should emit nextPage when the next button is clicked', () => {
      const nextSpy = vi.fn();

      component.nextPage.subscribe(nextSpy);

      setInputs(
        { status: 'success', data: mockResponse },
        mockBooks,
        1,
        true
      );

      const buttons = getPaginationButtons();

      buttons[1].click();

      expect(nextSpy).toHaveBeenCalledOnce();
    });
  });
});
