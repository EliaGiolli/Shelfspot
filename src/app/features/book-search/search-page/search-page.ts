import { 
  Component, 
  inject, 
  signal, 
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
import { BookSearchResult } from '../../../core/schemas/book-api.schema';

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
  private books$ = combineLatest([
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
        return of([]);
      }

      this.isLoading.set(true);

      return this.bookService.searchBooks(query, page).pipe(
        // this allows the loading state is back in case of errors or wrong previous request
        finalize(() => this.isLoading.set(false))
      );
    })
  );

  // if there isn't data, we use an empty array []
  books = toSignal(this.books$, { initialValue: [] });

  // Metodi per la UI
  goToNext() { this.currentPage.update(p => p + 1); }
  goToPrev() { this.currentPage.update(p => Math.max(1, p - 1)); }

  clearSearch() {
    this.formGroup.controls.bookInput.setValue(''); 
  }

  viewDetails(book: BookSearchResult) {
    // Puliamo la stringa '/works/OL12345W' per ottenere solo 'OL12345W'
    const bookId = book.key.replace('/works/', '');
    
    // Navighiamo verso la rotta specifica
    this.router.navigate(['/books/search', bookId]);
  }
}