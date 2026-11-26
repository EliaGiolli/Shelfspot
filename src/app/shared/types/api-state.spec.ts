import { describe, expect, it } from 'vitest';
import type { ApiState } from './api-state';
import type { Book } from './book';

describe('ApiState', () => {
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

  it('should represent the idle state', () => {
    const state: ApiState<Book> = { status: 'idle' };

    expect(state.status).toBe('idle');
  });

  it('should represent the loading state', () => {
    const state: ApiState<Book> = { status: 'loading' };

    expect(state.status).toBe('loading');
  });

  it('should represent the success state with data', () => {
    const state: ApiState<Book> = {
      status: 'success',
      data: mockBook,
    };

    expect(state.status).toBe('success');

    if (state.status === 'success') {
      expect(state.data).toEqual(mockBook);
    }
  });

  it('should represent the empty state', () => {
    const state: ApiState<Book[]> = { status: 'empty' };

    expect(state.status).toBe('empty');
  });

  it('should represent the error state with an error message', () => {
    const state: ApiState<Book> = {
      status: 'error',
      error: 'Network error',
    };

    expect(state.status).toBe('error');

    if (state.status === 'error') {
      expect(state.error).toBe('Network error');
    }
  });

  it('should represent the not-found state', () => {
    const state: ApiState<Book> = { status: 'not-found' };

    expect(state.status).toBe('not-found');
  });

  it('should support different data types', () => {
    const state: ApiState<Book[]> = {
      status: 'success',
      data: [mockBook],
    };

    expect(state.status).toBe('success');

    if (state.status === 'success') {
      expect(state.data).toHaveLength(1);
    }
  });
});
