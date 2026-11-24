import { describe, expect, it } from 'vitest';
import {
  mapSearchResultToBook,
  mapSubjectWorkToBook,
  mapWorkToBook,
  workIdFromKey,
} from './book.mapper';

describe('book.mapper', () => {
  it('extracts the work OLID from a /works/ key', () => {
    expect(workIdFromKey('/works/OL45804W')).toBe('OL45804W');
    expect(workIdFromKey('OL45804W')).toBe('OL45804W');
  });

  it('maps a search document to Book', () => {
    const book = mapSearchResultToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      author_name: ['Roald Dahl'],
      cover_i: 123,
      first_publish_year: 1970,
      subject: ['Animals'],
    });

    expect(book).toEqual({
      id: 'OL45804W',
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      authors: ['Roald Dahl'],
      coverId: 123,
      firstPublishYear: 1970,
      subjects: ['Animals'],
    });
  });

  it('maps missing search arrays to empty arrays and omits optional fields', () => {
    const book = mapSearchResultToBook({
      key: '/works/OL1W',
      title: 'Untitled',
    });

    expect(book.authors).toEqual([]);
    expect(book.subjects).toEqual([]);
    expect(book.coverId).toBeUndefined();
    expect(book.description).toBeUndefined();
    expect(book.firstPublishYear).toBeUndefined();
  });

  it('maps a work description string to Book.description', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      description: 'A farmer vs a fox.',
    });

    expect(book.description).toBe('A farmer vs a fox.');
    expect(book.authors).toEqual([]);
  });

  it('maps a work description object to Book.description', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      description: { value: 'A farmer vs a fox.' },
      covers: [99, 100],
      subjects: ['Fiction'],
      first_publish_date: 'June 1970',
    });

    expect(book.description).toBe('A farmer vs a fox.');
    expect(book.coverId).toBe(99);
    expect(book.subjects).toEqual(['Fiction']);
    expect(book.firstPublishYear).toBe(1970);
    expect(book.authors).toEqual([]);
  });

  it('maps a subject work to Book using author names and cover_id', () => {
    const book = mapSubjectWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      authors: [{ key: '/authors/OL1A', name: 'Roald Dahl' }],
      cover_id: 55,
      first_publish_year: 1970,
    });

    expect(book.authors).toEqual(['Roald Dahl']);
    expect(book.coverId).toBe(55);
    expect(book.id).toBe('OL45804W');
  });
});
