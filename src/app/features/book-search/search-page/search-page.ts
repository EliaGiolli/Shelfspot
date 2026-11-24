
import {
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Router,
  RouterOutlet,
  ActivatedRoute
} from '@angular/router';
import { of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  map,
  tap
} from 'rxjs/operators';
import {
  takeUntilDestroyed,
  toSignal
} from '@angular/core/rxjs-interop';

import { HttpBookService } from '../../../core/services/http-book.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Button } from '../../../shared/components/button/button';
import { CardComponent } from '../../../shared/components/card/card';
import { InputComponent } from '../../../shared/components/input/input';
import { CoverFallbackPipe } from '../../../shared/pipes/cover-fallback-pipe-pipe';
import {
  type Book,
  type BookSearchResponse
} from '../../../shared/types/book';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconComponent,
    InputComponent,
    Button,
    CardComponent,
    CoverFallbackPipe,
    RouterOutlet
  ],
  templateUrl: './search-page.html'
})
export class SearchPage {
  private bookService = inject(HttpBookService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(false);
  currentPage = signal(1);

  formGroup = new FormGroup({
    bookInput: new FormControl('', { nonNullable: true })
  });

  constructor() {
    // Listen for user input and update the URL after the debounce period.
    this.formGroup.controls.bookInput.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          q: query || null,
          page: 1
        },
        queryParamsHandling: 'merge'
      });
    });
  }

  // Listen to URL changes and use query parameters as the source of truth.
  private searchResponse$ = this.route.queryParamMap.pipe(
    map(params => {
      const query = params.get('q') ?? '';
      const pageParam = Number(params.get('page'));

      // Accept only positive integers; otherwise, default to page 1.
      const page = Number.isInteger(pageParam) && pageParam > 0
        ? pageParam
        : 1;

      return { query, page };
    }),

    distinctUntilChanged((previous, current) =>
      previous.query === current.query &&
      previous.page === current.page
    ),

    tap(({ query, page }) => {
      // Synchronize the search input without triggering valueChanges.
      if (this.formGroup.controls.bookInput.value !== query) {
        this.formGroup.controls.bookInput.setValue(query, {
          emitEvent: false
        });
      }

      // Synchronize the current page with the URL.
      this.currentPage.set(page);
    }),

    switchMap(({ query, page }) => {
      if (query.trim().length <= 2) {
        return of<BookSearchResponse>({
          books: [],
          totalFound: 0,
          page
        });
      }

      this.isLoading.set(true);

      return this.bookService.searchBooks(query, page).pipe(
        finalize(() => this.isLoading.set(false))
      );
    })
  );

  // Keep the entire response from the service.
  searchResponse = toSignal(this.searchResponse$, {
    initialValue: {
      books: [],
      totalFound: 0,
      page: 1
    }
  });

  // Derive the array of books from the response.
  books = computed(() => this.searchResponse().books);

  // Derive the hasNextPage flag from the response.
  hasNextPage = computed(() => {
    const { totalFound, page } = this.searchResponse();
    return page * 12 < totalFound;
  });

  goToNext() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage() + 1
      },
      queryParamsHandling: 'merge'
    });
  }

  goToPrev() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: Math.max(1, this.currentPage() - 1)
      },
      queryParamsHandling: 'merge'
    });
  }

  clearSearch() {
    this.formGroup.controls.bookInput.setValue('');
  }

  viewDetails(book: Book) {
    this.router.navigate(['/books', book.id]);
  }
}
