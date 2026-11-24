
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BookDetailComponent } from './book-detail';
import { HttpBookService } from '../../../core/services/http-book.service';
import { FavoriteService } from '../../../core/services/favorites.service';
import { LoanService } from '../../../core/services/loans.service';
import { ApiError } from '../../../core/errors/api-error';
import { type Book } from '../../../shared/types/book';

describe('BookDetailComponent', () => {
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let searchBookById: ReturnType<typeof vi.fn>;

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

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject(
      convertToParamMap({ bookId: 'book-1' })
    );

    searchBookById = vi.fn();

    await TestBed.configureTestingModule({
      imports: [BookDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          provide: HttpBookService,
          useValue: {
            searchBookById,
          },
        },
        {
          provide: FavoriteService,
          useValue: {
            isFavorite: vi.fn().mockReturnValue(false),
            toggleFavorite: vi.fn(),
          },
        },
        {
          provide: LoanService,
          useValue: {
            isBorrowed: vi.fn().mockReturnValue(false),
            addLoan: vi.fn(),
          },
        },
      ],
    })
      .overrideComponent(BookDetailComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  it('should start in loading state', () => {
    const pendingRequest = new Subject<Book | null>();
    searchBookById.mockReturnValue(pendingRequest.asObservable());

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'loading',
    });
  });

  it('should load the book successfully', () => {
    searchBookById.mockReturnValue(of(mockBook));

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'success',
      book: mockBook,
    });

    expect(searchBookById).toHaveBeenCalledWith('book-1');
  });

  it('should return not-found when the book does not exist', () => {
    searchBookById.mockReturnValue(of(null));

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'not-found',
    });
  });

  it('should return not-found when the API responds with a 404 error', () => {
    searchBookById.mockReturnValue(
      throwError(() => new ApiError('Book not found.', 'http', 404))
    );

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'not-found',
    });
  });

  it('should return an error state for other API errors', () => {
    searchBookById.mockReturnValue(
      throwError(() => new ApiError('Server unavailable.', 'http', 500))
    );

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'error',
      message: 'Server unavailable.',
    });
  });

  it('should handle unexpected errors', () => {
    searchBookById.mockReturnValue(
      throwError(() => new Error('Unexpected failure'))
    );

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'error',
      message: 'An unexpected error occurred while loading the book.',
    });
  });

  it('should load a new book when the route parameter changes', () => {
    const secondBook: Book = {
      ...mockBook,
      id: 'book-2',
      key: '/works/book-2',
      title: 'The Lord of the Rings',
    };

    searchBookById
      .mockReturnValueOnce(of(mockBook))
      .mockReturnValueOnce(of(secondBook));

    const fixture = TestBed.createComponent(BookDetailComponent);

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'success',
      book: mockBook,
    });

    paramMapSubject.next(
      convertToParamMap({ bookId: 'book-2' })
    );

    expect(searchBookById).toHaveBeenCalledTimes(2);
    expect(searchBookById).toHaveBeenLastCalledWith('book-2');

    expect(fixture.componentInstance.bookState()).toEqual({
      status: 'success',
      book: secondBook,
    });
  });

  it('should not reload the book when the route parameter has not changed', () => {
    searchBookById.mockReturnValue(of(mockBook));

    const fixture = TestBed.createComponent(BookDetailComponent);

    paramMapSubject.next(
      convertToParamMap({ bookId: 'book-1' })
    );

    expect(searchBookById).toHaveBeenCalledTimes(1);
  });
});
