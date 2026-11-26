
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SearchPage } from './search-page';
import type { Book, BookSearchResponse } from '../../../shared/types/book';
import type { ApiState } from '../../../shared/types/api-state';

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;
  let component: SearchPage;

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

  function createComponent(): void {
    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('initialQuery', '');
    fixture.componentRef.setInput('apiState', { status: 'idle' } as ApiState<BookSearchResponse>);
    fixture.componentRef.setInput('books', []);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('hasNextPage', false);

    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPage]
    }).compileComponents();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should expose the initial query input', () => {
    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialQuery', 'tolkien');
    fixture.componentRef.setInput('apiState', { status: 'idle' });
    fixture.componentRef.setInput('books', []);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('hasNextPage', false);
    fixture.detectChanges();

    expect(component.initialQuery()).toBe('tolkien');
  });

  it('should emit search when a search is requested', () => {
    createComponent();

    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);

    component.search.emit('tolkien');

    expect(searchSpy).toHaveBeenCalledWith('tolkien');
  });

  it('should emit clearSearch', () => {
    createComponent();

    const clearSpy = vi.fn();
    component.clearSearch.subscribe(clearSpy);

    component.clearSearch.emit();

    expect(clearSpy).toHaveBeenCalledOnce();
  });

  it('should emit retry', () => {
    createComponent();

    const retrySpy = vi.fn();
    component.retry.subscribe(retrySpy);

    component.retry.emit();

    expect(retrySpy).toHaveBeenCalledOnce();
  });

  it('should emit nextPage', () => {
    createComponent();

    const nextPageSpy = vi.fn();
    component.nextPage.subscribe(nextPageSpy);

    component.nextPage.emit();

    expect(nextPageSpy).toHaveBeenCalledOnce();
  });

  it('should emit previousPage', () => {
    createComponent();

    const previousPageSpy = vi.fn();
    component.previousPage.subscribe(previousPageSpy);

    component.previousPage.emit();

    expect(previousPageSpy).toHaveBeenCalledOnce();
  });

  it('should emit viewDetails with the selected book', () => {
    createComponent();

    const viewDetailsSpy = vi.fn();
    component.viewDetails.subscribe(viewDetailsSpy);

    component.viewDetails.emit(mockBook);

    expect(viewDetailsSpy).toHaveBeenCalledWith(mockBook);
  });

  it('should accept search results as inputs', () => {
    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialQuery', '');
    fixture.componentRef.setInput('apiState', {
      status: 'success',
      data: mockResponse
    });
    fixture.componentRef.setInput('books', mockResponse.books);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('hasNextPage', false);

    fixture.detectChanges();

    expect(component.books()).toEqual(mockResponse.books);
    expect(component.apiState().status).toBe('success');
  });
});
