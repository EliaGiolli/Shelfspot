
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { InputComponent } from '../../../shared/components/input/input';
import { Button } from '../../../shared/components/button/button';
import { AppLiveRegionDirective } from '../../../shared/directives/app-live-region.directive';

@Component({
  selector: 'app-search-book-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    Button,
    AppLiveRegionDirective
  ],
  template: `
    <form
      [formGroup]="searchForm"
      (ngSubmit)="submitSearch()"
      role="search"
      class="w-full"
    >
      <div class="flex items-center gap-3">
        <app-input
          formControlName="query"
          variant="search"
          type="search"
          placeholder="Search by title or author..."
          ariaLabel="Search books by title or author"
          id="book-search-input"
          ariaDescribedBy="search-validation-message"
        />

        <app-button
          type="submit"
          variant="primary"
          [disabled]="!canSearch()"
          ariaLabel="Search books"
        >
          Search
        </app-button>
      </div>

      <p
        id="search-validation-message"
        class="text-xs text-primary/50 mt-2"
        [class.invisible]="query().trim().length === 0 || canSearch()"
        appLiveRegion="polite"
      >
        @if (query().trim().length > 0 && !canSearch()) {
          Enter at least 3 characters to search.
        }
      </p>
    </form>
  `
})
export class SearchBookInput {
  initialQuery = input('');

  search = output<string>();

  readonly query = signal('');

  readonly canSearch = computed(
    () => this.query().trim().length >= 3
  );

  readonly searchForm = new FormGroup({
    query: new FormControl('', { nonNullable: true })
  });

  constructor() {
    // Synchronize the initial query with the form.
    effect(() => {
      const initialQuery = this.initialQuery();

      this.searchForm.controls.query.setValue(
        initialQuery,
        { emitEvent: false }
      );

      this.query.set(initialQuery);
    });

    // Keep the query signal synchronized with the form value.
    this.searchForm.controls.query.valueChanges.pipe(
      startWith(this.searchForm.controls.query.value),
      takeUntilDestroyed()
    ).subscribe(value => {
      this.query.set(value);
    });
  }

  submitSearch(): void {
    if (!this.canSearch()) {
      return;
    }

    this.search.emit(this.query().trim());
  }
}
