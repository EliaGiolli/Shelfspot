import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { HttpBookService } from './http-book.service';
import { API_URL } from '../tokens/api.token';
import { ApiError } from '../errors/api-error';

describe('HttpBookService', () => {
  let service: HttpBookService;
  let httpTestingController: HttpTestingController;

  const apiUrl = 'https://openlibrary.org';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpBookService,
        {
          provide: API_URL,
          useValue: apiUrl,
        },
      ],
    });

    service = TestBed.inject(HttpBookService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('searchBooks', () => {
    it('should fetch books using the correct URL and map the response', async () => {
      const mockResponse = {
        numFound: 1,
        start: 0,
        docs: [
          {
            key: '/works/OL45804W',
            title: 'Fantastic Mr. Fox',
            author_name: ['Roald Dahl'],
            cover_i: 123,
            first_publish_year: 1970,
            subject: ['Animals'],
          },
        ],
      };

      const resultPromise = firstValueFrom(
        service.searchBooks('Fantastic Mr. Fox')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/search.json?q=Fantastic%20Mr.%20Fox&page=1&limit=12`
      );

      expect(request.request.method).toBe('GET');

      request.flush(mockResponse);

      const result = await resultPromise;

      expect(result.totalFound).toBe(1);
      expect(result.page).toBe(1);
      expect(result.books).toHaveLength(1);

      expect(result.books[0]).toEqual({
        id: 'OL45804W',
        key: '/works/OL45804W',
        title: 'Fantastic Mr. Fox',
        authors: ['Roald Dahl'],
        coverId: 123,
        firstPublishYear: 1970,
        subjects: ['Animals'],
      });
    });

    it('should use the requested page', async () => {
      const resultPromise = firstValueFrom(
        service.searchBooks('Fantasy', 3)
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/search.json?q=Fantasy&page=3&limit=12`
      );

      request.flush({
        numFound: 30,
        start: 24,
        docs: [],
      });

      const result = await resultPromise;

      expect(result.page).toBe(3);
      expect(result.totalFound).toBe(30);
      expect(result.books).toEqual([]);
    });

    it('should throw ApiError when the response is invalid', async () => {
      const resultPromise = firstValueFrom(
        service.searchBooks('Fantasy')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/search.json?q=Fantasy&page=1&limit=12`
      );

      request.flush({
        numFound: 'invalid',
        start: 0,
        docs: [],
      });

      await expect(resultPromise).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('getBooksBySubject', () => {
    it('should fetch and map books by subject', async () => {
      const mockResponse = {
        works: [
          {
            key: '/works/OL45804W',
            title: 'Fantastic Mr. Fox',
            authors: [
              {
                key: '/authors/OL1A',
                name: 'Roald Dahl',
              },
            ],
            cover_id: 55,
            first_publish_year: 1970,
          },
        ],
      };

      const resultPromise = firstValueFrom(
        service.getBooksBySubject('Science Fiction')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/subjects/Science%20Fiction.json?limit=12&offset=0`
      );

      expect(request.request.method).toBe('GET');

      request.flush(mockResponse);

      const result = await resultPromise;

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'OL45804W',
        key: '/works/OL45804W',
        title: 'Fantastic Mr. Fox',
        authors: ['Roald Dahl'],
        coverId: 55,
        firstPublishYear: 1970,
        subjects: [],
      });
    });

    it('should calculate the correct offset for pagination', async () => {
      const resultPromise = firstValueFrom(
        service.getBooksBySubject('Fantasy', 3)
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/subjects/Fantasy.json?limit=12&offset=24`
      );

      request.flush({
        works: [],
      });

      const result = await resultPromise;

      expect(result).toEqual([]);
    });

    it('should throw ApiError when the subject response is invalid', async () => {
      const resultPromise = firstValueFrom(
        service.getBooksBySubject('Fantasy')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/subjects/Fantasy.json?limit=12&offset=0`
      );

      request.flush({
        works: [
          {
            title: 'Invalid Book',
          },
        ],
      });

      await expect(resultPromise).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('searchBookById', () => {
    it('should fetch and map a book by its ID', async () => {
      const mockResponse = {
        key: '/works/OL45804W',
        title: 'Fantastic Mr. Fox',
        description: 'A farmer vs a fox.',
        covers: [99],
        subjects: ['Fiction'],
        first_publish_date: 'June 1970',
      };

      const resultPromise = firstValueFrom(
        service.searchBookById('OL45804W')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/works/OL45804W.json`
      );

      expect(request.request.method).toBe('GET');

      request.flush(mockResponse);

      const result = await resultPromise;

      expect(result).toEqual({
        id: 'OL45804W',
        key: '/works/OL45804W',
        title: 'Fantastic Mr. Fox',
        authors: [],
        coverId: 99,
        description: 'A farmer vs a fox.',
        firstPublishYear: 1970,
        subjects: ['Fiction'],
      });
    });

    it('should throw ApiError when the work response is invalid', async () => {
      const resultPromise = firstValueFrom(
        service.searchBookById('OL45804W')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/works/OL45804W.json`
      );

      request.flush({
        key: '/works/OL45804W',
      });

      await expect(resultPromise).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('getFirstBookByQuery', () => {
    it('should return the first book from the search results', async () => {
      const resultPromise = firstValueFrom(
        service.getFirstBookByQuery('Fantastic Mr. Fox')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/search.json?q=Fantastic%20Mr.%20Fox&page=1&limit=12`
      );

      request.flush({
        numFound: 2,
        start: 0,
        docs: [
          {
            key: '/works/OL45804W',
            title: 'Fantastic Mr. Fox',
            author_name: ['Roald Dahl'],
          },
          {
            key: '/works/OL2W',
            title: 'Matilda',
            author_name: ['Roald Dahl'],
          },
        ],
      });

      const result = await resultPromise;

      expect(result).not.toBeNull();
      expect(result?.id).toBe('OL45804W');
      expect(result?.title).toBe('Fantastic Mr. Fox');
    });

    it('should return null when no books are found', async () => {
      const resultPromise = firstValueFrom(
        service.getFirstBookByQuery('Unknown Book')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/search.json?q=Unknown%20Book&page=1&limit=12`
      );

      request.flush({
        numFound: 0,
        start: 0,
        docs: [],
      });

      const result = await resultPromise;

      expect(result).toBeNull();
    });

    it('should propagate search errors', async () => {
      const resultPromise = firstValueFrom(
        service.getFirstBookByQuery('Unknown Book')
      );

      const request = httpTestingController.expectOne(
        `${apiUrl}/search.json?q=Unknown%20Book&page=1&limit=12`
      );

      request.flush(
        { message: 'Server error' },
        {
          status: 500,
          statusText: 'Internal Server Error',
        }
      );

      await expect(resultPromise).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});
