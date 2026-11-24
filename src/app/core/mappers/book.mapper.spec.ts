
import { describe, expect, it } from 'vitest';

import {
  mapSearchResultToBook,
  mapSubjectWorkToBook,
  mapWorkToBook,
  workIdFromKey,
} from './book.mapper';

describe('workIdFromKey', () => {
  it('should extract the work ID from a valid Open Library key', () => {
    expect(workIdFromKey('/works/OL45804W')).toBe('OL45804W');
  });

  it('should return the original key when it has no /works/ prefix', () => {
    expect(workIdFromKey('OL45804W')).toBe('OL45804W');
  });

  it('should preserve keys with a different prefix', () => {
    expect(workIdFromKey('/authors/OL21594A')).toBe('/authors/OL21594A');
  });
});

describe('mapSearchResultToBook', () => {
  it('should map a complete search document to Book', () => {
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

  it('should map missing arrays to empty arrays', () => {
    const book = mapSearchResultToBook({
      key: '/works/OL1W',
      title: 'Untitled',
    });

    expect(book.authors).toEqual([]);
    expect(book.subjects).toEqual([]);
  });

  it('should omit optional fields when they are missing', () => {
    const book = mapSearchResultToBook({
      key: '/works/OL1W',
      title: 'Untitled',
    });

    expect(book.coverId).toBeUndefined();
    expect(book.description).toBeUndefined();
    expect(book.firstPublishYear).toBeUndefined();
  });

  it('should reject invalid cover IDs through normalization', () => {
    const bookWithZeroCover = mapSearchResultToBook({
      key: '/works/OL1W',
      title: 'Untitled',
      cover_i: 0,
    });

    const bookWithNegativeCover = mapSearchResultToBook({
      key: '/works/OL2W',
      title: 'Untitled',
      cover_i: -10,
    });

    expect(bookWithZeroCover.coverId).toBeUndefined();
    expect(bookWithNegativeCover.coverId).toBeUndefined();
  });
});

describe('mapWorkToBook', () => {
  it('should map a work with a string description', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      description: 'A farmer vs a fox.',
    });

    expect(book.description).toBe('A farmer vs a fox.');
    expect(book.authors).toEqual([]);
  });

  it('should map a work with an object description', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      description: {
        value: 'A farmer vs a fox.',
      },
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

  it('should use only the first cover ID', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      covers: [99, 100],
    });

    expect(book.coverId).toBe(99);
  });

  it('should omit an empty description', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      description: '',
    });

    expect(book.description).toBeUndefined();
  });

  it('should omit invalid cover IDs', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      covers: [0, 100],
    });

    expect(book.coverId).toBeUndefined();
  });

  it('should omit the publication year when the date is missing', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
    });

    expect(book.firstPublishYear).toBeUndefined();
  });

  it('should omit the publication year when the date contains no four-digit year', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      first_publish_date: 'Unknown',
    });

    expect(book.firstPublishYear).toBeUndefined();
  });

  it('should extract the first four-digit year from a publication date', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      first_publish_date: 'June 1970, revised in 1980',
    });

    expect(book.firstPublishYear).toBe(1970);
  });

  it('should map missing subjects to an empty array', () => {
    const book = mapWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
    });

    expect(book.subjects).toEqual([]);
  });
});

describe('mapSubjectWorkToBook', () => {
  it('should map a subject work to Book', () => {
    const book = mapSubjectWorkToBook({
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
    });

    expect(book).toEqual({
      id: 'OL45804W',
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      authors: ['Roald Dahl'],
      coverId: 55,
      firstPublishYear: 1970,
      subjects: [],
    });
  });

  it('should map missing authors to an empty array', () => {
    const book = mapSubjectWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
    });

    expect(book.authors).toEqual([]);
  });

  it('should omit optional fields when they are missing', () => {
    const book = mapSubjectWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
    });

    expect(book.coverId).toBeUndefined();
    expect(book.firstPublishYear).toBeUndefined();
  });

  it('should omit invalid cover IDs', () => {
    const book = mapSubjectWorkToBook({
      key: '/works/OL45804W',
      title: 'Fantastic Mr. Fox',
      cover_id: 0,
    });

    expect(book.coverId).toBeUndefined();
  });
});
