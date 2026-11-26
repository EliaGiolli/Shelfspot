
import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  EMPTY,
  Subject,
  of
} from 'rxjs';

import {
  catchError,
  distinctUntilChanged,
  map,
  mergeWith,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  toSignal
} from '@angular/core/rxjs-interop';

import { HttpBookService } from '../../../core/services/http-book.service';

import { SearchPage } from '../search-page/search-page';

import type {
  Book,
  BookSearchResponse
} from '../../../shared/types/book';
import type { ApiState } from '../../../shared/types/api-state';


@Component({
  selector: 'app-search-container',
  standalone: true,
  imports: [
    SearchPage,
  ],
  templateUrl: './search-container.html'
})
export class SearchContainer {
  private readonly retrySearchTrigger = new Subject<void>();

  private readonly bookService = inject(HttpBookService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly apiState = signal<ApiState<BookSearchResponse>>({
    status: 'idle'
  });

  readonly currentPage = signal(1);

  readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('q') ?? '')
    ),
    { initialValue: '' }
  );

  private readonly searchResponse$ = this.route.queryParamMap.pipe(
    map(params => {
      const query = params.get('q') ?? '';
      const pageParam = Number(params.get('page'));

      const page = Number.isInteger(pageParam) && pageParam > 0
        ? pageParam
        : 1;

      return { query, page };
    }),

    distinctUntilChanged((previous, current) =>
      previous.query === current.query &&
      previous.page === current.page
    ),

    mergeWith(
      this.retrySearchTrigger.pipe(
        map(() => ({
          query: this.route.snapshot.queryParamMap.get('q') ?? '',
          page: this.currentPage()
        }))
      )
    ),

    tap(({ page }) => {
      this.currentPage.set(page);
    }),

    switchMap(({ query, page }) => {
      if (query.trim().length <= 2) {
        this.apiState.set({ status: 'idle' });

        return of<BookSearchResponse>({
          books: [],
          totalFound: 0,
          page
        });
      }

      this.apiState.set({ status: 'loading' });

      return this.bookService.searchBooks(query, page).pipe(
        tap(response => {
          this.apiState.set(
            response.books.length === 0
              ? { status: 'empty' }
              : { status: 'success', data: response }
          );
        }),

        catchError((error: unknown) => {
          console.error('Failed to search books.', error);

          this.apiState.set({
            status: 'error',
            error: error instanceof Error
              ? error.message
              : 'An unexpected error occurred.'
          });

          return EMPTY;
        })
      );
    })
  );

  readonly searchResponse = toSignal(this.searchResponse$, {
    initialValue: {
      books: [],
      totalFound: 0,
      page: 1
    }
  });

  readonly books = computed(() => this.searchResponse().books);

  readonly hasNextPage = computed(() => {
    const { totalFound, page } = this.searchResponse();

    return page * 12 < totalFound;
  });

  submitSearch(query: string): void {
    const currentQuery =
      this.route.snapshot.queryParamMap.get('q') ?? '';

    const currentPage = Number(
      this.route.snapshot.queryParamMap.get('page') ?? 1
    );

    if (query === currentQuery && currentPage === 1) {
      this.retrySearch();
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: query,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: null,
        page: null
      },
      queryParamsHandling: 'merge'
    });
  }

  goToNext(): void {
    if (!this.hasNextPage()) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage() + 1
      },
      queryParamsHandling: 'merge'
    });
  }

  goToPrev(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: Math.max(1, this.currentPage() - 1)
      },
      queryParamsHandling: 'merge'
    });
  }

  viewDetails(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  retrySearch(): void {
    this.retrySearchTrigger.next();
  }
}
