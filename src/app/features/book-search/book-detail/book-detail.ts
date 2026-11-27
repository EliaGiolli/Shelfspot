import { AppLiveRegionDirective } from '../../../shared/directives/app-live-region.directive';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  of,
  startWith,
  switchMap,
  Subject,
  mergeWith
} from 'rxjs';

// Services
import { HttpBookService } from '../../../core/services/http-book.service';
import { FavoriteService } from '../../../core/services/favorites.service';
import { LoanService } from '../../../core/services/loans.service';

// Errors
import { ApiError } from '../../../core/errors/api-error';

// Types
import type { Book } from '../../../shared/types/book';

// Custom Components
import { IconComponent } from '../../../shared/components/icon/icon';
import { Button } from '../../../shared/components/button/button';

// Pipes and Directives
import { CoverFallbackPipe } from '../../../shared/pipes/cover-fallback-pipe-pipe';

type BookDetailState =
  | { status: 'loading' }
  | { status: 'success'; book: Book }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    IconComponent,
    Button,
    CoverFallbackPipe,
    RouterLink,
    AppLiveRegionDirective,
  ],
  templateUrl: './book-detail.html'
})
export class BookDetailComponent {
  private route = inject(ActivatedRoute);
  private bookService = inject(HttpBookService);

  public favoriteService = inject(FavoriteService);
  public loanService = inject(LoanService);

  private readonly retryTrigger = new Subject<void>();

  // Read the book ID and load its details.
  bookState = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('bookId')),
      filter((id): id is string => id !== null),
      distinctUntilChanged(),

      mergeWith(
        this.retryTrigger.pipe(
          map(() => this.route.snapshot.paramMap.get('bookId')),
          filter((id): id is string => id !== null)
        )
      ),

      switchMap(id =>
        this.bookService.searchBookById(id).pipe(
          map(book => {
            const state: BookDetailState = book
              ? { status: 'success', book }
              : { status: 'not-found' };

            return state;
          }),

          startWith<BookDetailState>({ status: 'loading' }),

          catchError((error: unknown) => {
            if (error instanceof ApiError && error.status === 404) {
              return of<BookDetailState>({ status: 'not-found' });
            }

            const message = error instanceof ApiError
              ? error.message
              : 'An unexpected error occurred while loading the book.';

            return of<BookDetailState>({
              status: 'error',
              message
            });
          })
        )
      )
    ),
    {
      initialValue: { status: 'loading' } as BookDetailState
    }
  );

  retryBookLoad(): void {
    this.retryTrigger.next();
  }
}
