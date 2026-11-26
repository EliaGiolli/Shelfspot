import { Component, input, output } from '@angular/core';

import { Button } from '../../../shared/components/button/button';
import { CardComponent } from '../../../shared/components/card/card';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CoverFallbackPipe } from '../../../shared/pipes/cover-fallback-pipe-pipe';

import type {
  Book,
  BookSearchResponse
} from '../../../shared/types/book';
import type { ApiState } from '../../../shared/types/api-state';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    Button,
    CardComponent,
    IconComponent,
    CoverFallbackPipe
  ],
  templateUrl: './search-results.html'
})
export class SearchResults {
  apiState = input.required<ApiState<BookSearchResponse>>();
  books = input.required<Book[]>();
  currentPage = input.required<number>();
  hasNextPage = input.required<boolean>();

  retry = output<void>();
  nextPage = output<void>();
  previousPage = output<void>();
  viewDetails = output<Book>();
}
