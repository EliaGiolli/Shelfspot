
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
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
import { type Book, type BookSearchResponse } from '../../../shared/types/book';

describe('SearchPage', () => {
  let queryParamMapSubject: BehaviorSubject<ReturnType<typeof createParamMap>>;
  let searchBooks: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  const createParamMap = (params: Record<string, string>) => {
    const values = new Map(Object.entries(params));

    return {
      get: (key: string) => values.get(key) ?? null,
    } as ReturnType<ActivatedRoute['snapshot']['queryParamMap']['get']> extends never
      ? never
      : any;
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

  const mockResponse: BookSearchResponse = {
    books: [mockBook],
    totalFound: 30,
    page: 1,
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    queryParamMapSubject = new BehaviorSubject(
      createParamMap({})
    );

    searchBooks = vi.fn().mockReturnValue(of(mockResponse));
    navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate,
          },
        },
        {
          provide: HttpBookService,
          useValue: {
            searchBooks,
          },
        },
      ],
    })
      .overrideComponent(SearchPage, {
        set: { template: '' },
      })
      .compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with an empty search response', () => {
    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    expect(component.isLoading()).toBe(false);
    expect(component.currentPage()).toBe(1);
    expect(component.searchResponse()).toEqual({
      books: [],
      totalFound: 0,
      page: 1,
    });
    expect(component.books()).toEqual([]);
    expect(component.hasNextPage()).toBe(false);
  });

  it('should search when the URL contains a query longer than two characters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' })
    );

    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
    expect(component.books()).toEqual([mockBook]);
  });

  it('should not search when the query has two or fewer characters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'ab', page: '1' })
    );

    TestBed.createComponent(SearchPage);

    expect(searchBooks).not.toHaveBeenCalled();
  });

  it('should synchronize the form with URL query parameters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' })
    );

    const fixture = TestBed.createComponent(SearchPage);

    expect(
      fixture.componentInstance.formGroup.controls.bookInput.value
    ).toBe('tolkien');
  });

  it('should synchronize the current page with URL query parameters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '3' })
    );

    const fixture = TestBed.createComponent(SearchPage);

    expect(fixture.componentInstance.currentPage()).toBe(3);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 3);
  });

  it('should default to page 1 when the URL page is invalid', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: 'invalid' })
    );

    const fixture = TestBed.createComponent(SearchPage);

    expect(fixture.componentInstance.currentPage()).toBe(1);
    expect(searchBooks).toHaveBeenCalledWith('tolkien', 1);
  });

  it('should calculate whether a next page exists', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' })
    );

    const fixture = TestBed.createComponent(SearchPage);

    expect(fixture.componentInstance.hasNextPage()).toBe(true);
  });

  it('should return false when there are no more results', () => {
    const response: BookSearchResponse = {
      books: [mockBook],
      totalFound: 12,
      page: 1,
    };

    searchBooks.mockReturnValue(of(response));

    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' })
    );

    const fixture = TestBed.createComponent(SearchPage);

    expect(fixture.componentInstance.hasNextPage()).toBe(false);
  });

  it('should navigate to the next page', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '2' })
    );

    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    component.goToNext();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 3 },
      queryParamsHandling: 'merge',
    });
  });

  it('should navigate to the previous page', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '2' })
    );

    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    component.goToPrev();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('should not navigate to a page lower than 1', () => {
    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    component.goToPrev();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('should clear the search input', () => {
    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    component.formGroup.controls.bookInput.setValue('tolkien');
    component.clearSearch();

    expect(component.formGroup.controls.bookInput.value).toBe('');
  });

  it('should navigate to the selected book details', () => {
    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    component.viewDetails(mockBook);

    expect(navigate).toHaveBeenCalledWith(['/books', 'book-1']);
  });

  it('should update the URL after the debounce period', async () => {
    const fixture = TestBed.createComponent(SearchPage);
    const component = fixture.componentInstance;

    component.formGroup.controls.bookInput.setValue('tolkien');

    await vi.advanceTimersByTimeAsync(249);

    expect(navigate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: {
        q: 'tolkien',
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('should not trigger duplicate searches for unchanged URL parameters', () => {
    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' })
    );

    TestBed.createComponent(SearchPage);

    queryParamMapSubject.next(
      createParamMap({ q: 'tolkien', page: '1' })
    );

    expect(searchBooks).toHaveBeenCalledTimes(1);
  });
});
