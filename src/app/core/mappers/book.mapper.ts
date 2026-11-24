import { type Book } from '../../shared/types/book';
import {
  type SearchDocDto,
  type SubjectWorkDto,
  type OpenLibraryWorkResponseDto,
} from '../schemas/book-api.schema';

// extracts the work id from the key
export function workIdFromKey(key: string): string {
  return key.replace(/^\/works\//, '');
}

// validates the cover id
function validCoverId(id: number | undefined): number | undefined {
  return id !== undefined && id > 0 ? id : undefined;
}

// parses the publish year from the date
function parsePublishYear(date: string | undefined): number | undefined {
  if (!date) {
    return undefined;
  }

  const match = date.match(/\d{4}/);
  if (!match) {
    return undefined;
  }

  return Number(match[0]);
}

// maps the optional fields to the Book type
function withOptionalFields(
  book: Book,
  extras: {
    coverId?: number;
    description?: string;
    firstPublishYear?: number;
  }
): Book {
  if (extras.coverId !== undefined) {
    book.coverId = extras.coverId;
  }
  if (extras.description !== undefined && extras.description !== '') {
    book.description = extras.description;
  }
  if (extras.firstPublishYear !== undefined) {
    book.firstPublishYear = extras.firstPublishYear;
  }
  return book;
}

// maps the response to the Book type
export function mapSearchResultToBook(doc: SearchDocDto): Book {
  return withOptionalFields(
    {
      id: workIdFromKey(doc.key),
      key: doc.key,
      title: doc.title,
      authors: doc.author_name ?? [],
      subjects: doc.subject ?? [],
    },
    {
      coverId: validCoverId(doc.cover_i),
      firstPublishYear: doc.first_publish_year,
    }
  );
}

// maps the description to a string
function workDescriptionToString(description: OpenLibraryWorkResponseDto['description']): string | undefined {
  if (description === undefined) {
    return undefined;
  }

  return typeof description === 'string' ? description : description.value;
}

// maps the response to the Book type
export function mapWorkToBook(work: OpenLibraryWorkResponseDto): Book {
  return withOptionalFields(
    {
      id: workIdFromKey(work.key),
      key: work.key,
      title: work.title,
      authors: [],
      subjects: work.subjects ?? [],
    },
    {
      coverId: validCoverId(work.covers?.[0]),
      description: workDescriptionToString(work.description),
      firstPublishYear: parsePublishYear(work.first_publish_date),
    }
  );
}

// maps the response to the Book type
export function mapSubjectWorkToBook(work: SubjectWorkDto): Book {
  return withOptionalFields(
    {
      id: workIdFromKey(work.key),
      key: work.key,
      title: work.title,
      authors: work.authors?.map(author => author.name) ?? [],
      subjects: [],
    },
    {
      coverId: validCoverId(work.cover_id),
      firstPublishYear: work.first_publish_year,
    }
  );
}
