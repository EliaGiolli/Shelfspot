
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SearchPage } from './search-page';
import { HttpBookService } from '../../../core/services/http-book.service';
import type { BookSearchResponse } from '../../../shared/types/book';

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;
  let component: SearchPage;
  let queryParamMapSubject: BehaviorSubject<ReturnType<typeof createParamMap>>;
  let searchBooks: ReturnType<typeof vi.fn>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockResponse: BookSearchResponse = {
    books: [
      {
        id: 'book-1',
        key: '/works/book-1',
        title: 'The Hobbit',
        authors: ['J.R.R. Tolkien'],
        subjects: ['Fantasy'],
        coverId: 123,
        firstPublishYear: 1937,
      },
    ],
    totalFound: 1,
    page: 1,
  };

  function createParamMap(params: Record<string, string> = {}) {
    return {
      get: (key: string) => params[key] ?? null,
    } as any;
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  
  beforeEach(() => {
    queryParamMapSubject = new BehaviorSubject(createParamMap());

    searchBooks = vi.fn().mockReturnValue(of(mockResponse));

    router = {
      navigate: vi.fn(),
    };

    TestBed.overrideComponent(SearchPage, {
      set: {
        template: '',
      },
    });

    TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        {
          provide: HttpBookService,
          useValue: { searchBooks },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    });
  });


  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should initialize with the idle API state', () => {
    createComponent();

    expect(component.apiState()).toEqual({ status: 'idle' });
  });

  it('should enter the loading state while a search request is pending', () => {
    const responseSubject = new Subject<BookSearchResponse>();
    searchBooks.mockReturnValue(responseSubject.asObservable());

    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    expect(component.apiState()).toEqual({ status: 'loading' });

    responseSubject.next(mockResponse);

    expect(component.apiState()).toEqual({ status: 'loading' });

    responseSubject.complete();

    expect(component.apiState()).toEqual({ status: 'idle' });
  });

  it('should synchronize the form with the query parameter', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    expect(component.formGroup.controls.bookInput.value).toBe('tolkien');
  });

  it('should search when the query contains more than two characters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
  });

  it('should not search when the query contains two or fewer characters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'ab', page: '1' }),
    );

    createComponent();

    expect(searchBooks).not.toHaveBeenCalled();
  });

  it('should use page one when the page parameter is invalid', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: 'invalid' }),
    );

    createComponent();

    expect(component.currentPage()).toBe(1);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
  });

  it('should use page one when the page parameter is missing', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien' }),
    );

    createComponent();

    expect(component.currentPage()).toBe(1);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
  });

  it('should update the current page from the query parameter', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '2' }),
    );

    createComponent();

    expect(component.currentPage()).toBe(2);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 2);
  });

  it('should update the URL when the search input changes', () => {
    vi.useFakeTimers();

    createComponent();

    component.formGroup.controls.bookInput.setValue('tolkien');

    vi.advanceTimersByTime(250);

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: {
          q: 'tolkien',
          page: 1,
        },
        queryParamsHandling: 'merge',
      }),
    );
  });

  it('should reset the page to one when the search input changes', () => {
    vi.useFakeTimers();

    createComponent();

    component.formGroup.controls.bookInput.setValue('tolkien');

    vi.advanceTimersByTime(250);

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({
          page: 1,
        }),
      }),
    );
  });

  it('should expose books from the search response', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    expect(component.books()).toEqual(mockResponse.books);
  });

  it('should calculate whether another page is available', () => {
    const responseWithMoreResults: BookSearchResponse = {
      ...mockResponse,
      totalFound: 24,
    };

    searchBooks.mockReturnValue(of(responseWithMoreResults));

    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    expect(component.hasNextPage()).toBe(true);
  });

  it('should not request another page when all results fit on the current page', () => {
    searchBooks.mockReturnValue(of(mockResponse));

    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    expect(component.hasNextPage()).toBe(false);
  });

  it('should not repeat the same search when query parameters do not change', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    createComponent();

    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' }),
    );

    expect(searchBooks).toHaveBeenCalledTimes(1);
  });
});
