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
  Validators 
} from '@angular/forms';
import { 
  Router, 
  RouterOutlet, 
  ActivatedRoute 
} from '@angular/router';
import { combineLatest } from 'rxjs';
import { 
  debounceTime, 
  startWith,
  distinctUntilChanged, 
  switchMap, 
  tap, 
  finalize
} from 'rxjs/operators';
import { of } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
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

  constructor() {
    // ActivatedRoute reads the 'q' param from the URL
    const query = this.route.snapshot.queryParamMap.get('q') ?? '';

    if(query) {
      // setValue() updates the FormControl
      this.formGroup.controls.bookInput.setValue(query);
    }
  }

  formGroup = new FormGroup({
    bookInput: new FormControl('', { nonNullable: true })
  });

  // An Observable defines the stream of search
  // Combines the value changes of the bookInput form control and the current page signal
  private searchResponse$ = combineLatest([
    this.formGroup.controls.bookInput.valueChanges.pipe(
      startWith(this.formGroup.controls.bookInput.value),
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.currentPage.set(1))
    ),
    toObservable(this.currentPage)
  ]).pipe(
    switchMap(([query, page]) => {
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

  // Keep the entire response from the service
  searchResponse = toSignal(this.searchResponse$, {
    initialValue: {
      books: [],
      totalFound: 0,
      page: 1
    }
  });

  // Derive the array of books from the response
  books = computed(() => this.searchResponse().books);

  // Derive the hasNextPage flag from the response
  hasNextPage = computed(() => {
    const { totalFound, page } = this.searchResponse();
    return page * 12 < totalFound;
  });


  // Metodi per la UI
  goToNext() { this.currentPage.update(p => p + 1); }
  goToPrev() { this.currentPage.update(p => Math.max(1, p - 1)); }

  clearSearch() {
    this.formGroup.controls.bookInput.setValue(''); 
  }

  viewDetails(book: Book) {
    this.router.navigate(['/books/search', book.id]);
  }
}