
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SearchContainer } from './search-container';
import { HttpBookService } from '../../../core/services/http-book.service';

import type {
  Book,
  BookSearchResponse
} from '../../../shared/types/book';

describe('SearchContainer', () => {
  let fixture: ComponentFixture<SearchContainer>;
  let component: SearchContainer;

  let queryParamMapSubject: BehaviorSubject<ReturnType<typeof createParamMap>>;
  let searchBooks: ReturnType<typeof vi.fn>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockBook: Book = {
    id: 'book-1',
    key: '/works/book-1',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    subjects: ['Fantasy'],
    coverId: 123,
    firstPublishYear: 1937
  };

  const mockResponse: BookSearchResponse = {
    books: [mockBook],
    totalFound: 1,
    page: 1
  };

  let currentParams: Record<string, string>;

  function createParamMap(params: Record<string, string> = {}) {
    return {
      get: (key: string) => params[key] ?? null
    } as any;
  }

  function updateQueryParams(params: Record<string, string> = {}): void {
    currentParams = params;
    queryParamMapSubject.next(createParamMap(params));
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(SearchContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    currentParams = {};

    queryParamMapSubject = new BehaviorSubject(
      createParamMap(currentParams)
    );

    searchBooks = vi.fn().mockReturnValue(of(mockResponse));

    router = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SearchContainer],
      providers: [
        {
          provide: HttpBookService,
          useValue: { searchBooks }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
            snapshot: {
              get queryParamMap() {
                return createParamMap(currentParams);
              }
            }
          }
        },
        {
          provide: Router,
          useValue: router
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should initialize with the idle API state', () => {
    createComponent();

    expect(component.apiState()).toEqual({ status: 'idle' });
  });

  it('should expose the query parameter as routeQuery', () => {
    updateQueryParams({ q: 'tolkien' });

    createComponent();

    expect(component.routeQuery()).toBe('tolkien');
  });

  it('should not search when the query contains two or fewer characters', () => {
    updateQueryParams({ q: 'ab', page: '1' });

    createComponent();

    expect(searchBooks).not.toHaveBeenCalled();
    expect(component.apiState()).toEqual({ status: 'idle' });
  });

  it('should enter the loading state while a search request is pending', () => {
    const responseSubject = new Subject<BookSearchResponse>();
    searchBooks.mockReturnValue(responseSubject.asObservable());

    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    expect(component.apiState()).toEqual({ status: 'loading' });

    responseSubject.next(mockResponse);

    expect(component.apiState()).toEqual({
      status: 'success',
      data: mockResponse
    });
  });

  it('should enter the success state when books are found', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    expect(component.apiState()).toEqual({
      status: 'success',
      data: mockResponse
    });

    expect(component.books()).toEqual(mockResponse.books);
  });

  it('should enter the empty state when no books are found', () => {
    searchBooks.mockReturnValue(
      of({
        books: [],
        totalFound: 0,
        page: 1
      })
    );

    updateQueryParams({ q: 'unknown book', page: '1' });

    createComponent();

    expect(component.apiState()).toEqual({ status: 'empty' });
    expect(component.books()).toEqual([]);
  });

  it('should enter the error state when the search request fails', () => {
    const error = new Error('Network error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    searchBooks.mockReturnValue(
      throwError(() => error)
    );

    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    expect(component.apiState()).toEqual({
      status: 'error',
      error: 'Network error'
    });

    consoleErrorSpy.mockRestore();
  });

  it('should use page one when the page parameter is invalid', () => {
    updateQueryParams({ q: 'tolkien', page: 'invalid' });

    createComponent();

    expect(component.currentPage()).toBe(1);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
  });

  it('should use page one when the page parameter is missing', () => {
    updateQueryParams({ q: 'tolkien' });

    createComponent();

    expect(component.currentPage()).toBe(1);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
  });

  it('should update the current page from the query parameter', () => {
    updateQueryParams({ q: 'tolkien', page: '2' });

    createComponent();

    expect(component.currentPage()).toBe(2);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 2);
  });

  it('should calculate whether another page is available', () => {
    searchBooks.mockReturnValue(
      of({
        ...mockResponse,
        totalFound: 24
      })
    );

    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    expect(component.hasNextPage()).toBe(true);
  });

  it('should return false when all results fit on the current page', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    expect(component.hasNextPage()).toBe(false);
  });

  it('should navigate to the next page when another page is available', () => {
    searchBooks.mockReturnValue(
      of({
        ...mockResponse,
        totalFound: 24
      })
    );

    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    component.goToNext();

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { page: 2 },
        queryParamsHandling: 'merge'
      })
    );
  });

  it('should not navigate to the next page when no more results are available', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    component.goToNext();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to the previous page without going below page one', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    component.goToPrev();

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { page: 1 },
        queryParamsHandling: 'merge'
      })
    );
  });

  it('should navigate to the previous page from page two', () => {
    updateQueryParams({ q: 'tolkien', page: '2' });

    createComponent();

    component.goToPrev();

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { page: 1 },
        queryParamsHandling: 'merge'
      })
    );
  });

  it('should navigate with the submitted search query and reset the page', () => {
    updateQueryParams({ q: 'tolkien', page: '2' });

    createComponent();

    component.submitSearch('asimov');

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: {
          q: 'asimov',
          page: 1
        },
        queryParamsHandling: 'merge'
      })
    );
  });

  it('should retry when submitting the same query on page one', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    component.submitSearch('tolkien');

    expect(searchBooks).toHaveBeenCalledTimes(2);
    expect(searchBooks).toHaveBeenLastCalledWith('tolkien', 1);
  });

  it('should clear the search query and page parameters', () => {
    updateQueryParams({ q: 'tolkien', page: '2' });

    createComponent();

    component.clearSearch();

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: {
          q: null,
          page: null
        },
        queryParamsHandling: 'merge'
      })
    );
  });

  it('should navigate to the selected book details', () => {
    createComponent();

    component.viewDetails(mockBook);

    expect(router.navigate).toHaveBeenCalledWith([
      '/books',
      'book-1'
    ]);
  });

  it('should not repeat the same search when query parameters do not change', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    updateQueryParams({ q: 'tolkien', page: '1' });

    expect(searchBooks).toHaveBeenCalledTimes(1);
  });

  it('should retry the current search when retrySearch is called', () => {
    updateQueryParams({ q: 'tolkien', page: '1' });

    createComponent();

    component.retrySearch();

    expect(searchBooks).toHaveBeenCalledTimes(2);
    expect(searchBooks).toHaveBeenLastCalledWith('tolkien', 1);
  });
});
