import {
    Injectable,
    inject,
  } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { map, Observable } from 'rxjs';
  
  import { API_URL } from '../tokens/api.token';
  import { ApiError } from '../errors/api-error';
  
  import {
    type Book,
    type BookSearchResponse,
  } from '../../shared/types/book';
  
  import {
    SearchResponseSchema,
    SubjectResponseSchema,
    OpenLibraryWorkResponseDto,
    OpenLibraryWorkResponseSchema,
  } from '../schemas/book-api.schema';
  
  import {
    mapSearchResultToBook,
    mapSubjectWorkToBook,
    mapWorkToBook,
  } from '../mappers/book.mapper';
  
  @Injectable({ providedIn: 'root' })
  export class HttpBookService {
    private http = inject(HttpClient);
    private readonly API_URL = inject(API_URL);
  
    searchBooks(
      query: string,
      page: number = 1
    ): Observable<BookSearchResponse> {
      const limit = 12;
      const params = `?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
  
      return this.http.get<unknown>(
        `${this.API_URL}/search.json${params}`
      ).pipe(
        map(rawResponse => {
          const result = SearchResponseSchema.safeParse(rawResponse);
  
          if (!result.success) {
            throw new ApiError(
              'Invalid Open Library search response.',
              'validation',
              undefined,
              result.error.issues
            );
          }
  
          return {
            books: result.data.docs.map(mapSearchResultToBook),
            totalFound: result.data.numFound,
            page
          };
        })
      );
    }
  
    // Maps the response to the Book type.
    getBooksBySubject(
      subject: string,
      page: number = 1
    ): Observable<Book[]> {
      const limit = 12;
      const offset = (page - 1) * limit;
      const params = `?limit=${limit}&offset=${offset}`;
  
      return this.http.get<unknown>(
        `${this.API_URL}/subjects/${encodeURIComponent(subject)}.json${params}`
      ).pipe(
        map(rawResponse => {
          const result = SubjectResponseSchema.safeParse(rawResponse);
  
          if (!result.success) {
            throw new ApiError(
              'Invalid Open Library subject response.',
              'validation',
              undefined,
              result.error.issues
            );
          }
  
          return result.data.works.map(mapSubjectWorkToBook);
        })
      );
    }
  
    // Maps the work detail response to the Book type.
    searchBookById(id: string): Observable<Book | null> {
      return this.http.get<unknown>(
        `${this.API_URL}/works/${id}.json`
      ).pipe(
        map(rawResponse => {
          const result = OpenLibraryWorkResponseSchema.safeParse(rawResponse);
  
          if (!result.success) {
            throw new ApiError(
              'Invalid Open Library work response.',
              'validation',
              undefined,
              result.error.issues
            );
          }
  
          return mapWorkToBook(result.data);
        })
      );
    }
  
    // Maps the first book in the response to the Book type.
    getFirstBookByQuery(query: string): Observable<Book | null> {
      return this.searchBooks(query).pipe(
        map(response =>
          response.books.length > 0
            ? response.books[0]
            : null
        )
      );
    }
  }
  