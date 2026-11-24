export interface Book {
  id: string;
  key: string;
  title: string;
  authors: string[];
  coverId?: number;
  description?: string;
  firstPublishYear?: number;
  subjects: string[];
}


export interface BookSearchResponse {
  // maps the docs in the DTO
  books: Book[];
  // maps the numFound in the DTO
  totalFound: number;
  // maps the start in the DTO
  page: number;
}
