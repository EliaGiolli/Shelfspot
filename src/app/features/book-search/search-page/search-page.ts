import {
  Component,
  input,
  output
} from '@angular/core';

import { IconComponent } from '../../../shared/components/icon/icon';

import { SearchBookInput } from '../search-book-input/search-book-input';
import { SearchResults } from '../search-results/search-results';

import type {
  Book,
  BookSearchResponse
} from '../../../shared/types/book';

import type { ApiState } from '../../../shared/types/api-state';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    IconComponent,
    SearchBookInput,
    SearchResults
  ],
  templateUrl: './search-page.html'
})
export class SearchPage {
  initialQuery = input('');

  apiState = input.required<ApiState<BookSearchResponse>>();
  books = input.required<Book[]>();
  currentPage = input.required<number>();
  hasNextPage = input.required<boolean>();

  search = output<string>();
  clearSearch = output<void>();
  retry = output<void>();
  nextPage = output<void>();
  previousPage = output<void>();
  viewDetails = output<Book>();
}
