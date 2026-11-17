import { 
  Component, 
  inject, 
  signal, 
  OnInit 
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpBookService } from '../../../../core/services/http-book.service';
import { type BookSearchResult } from '../../../../core/schemas/book-api.schema';
import { CardComponent } from '../../../../shared/components/card/card';
import { BookSkeleton } from '../../../../shared/components/book-skeleton/book-skeleton';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-book-preview',
  standalone: true,
  imports: [CardComponent,BookSkeleton, RouterLink],
  templateUrl: './book-preview.html',
})
export class BookPreview implements OnInit{
  private httpBookService = inject(HttpBookService);

  protected books = signal<BookSearchResult[]>([]);
  protected isLoading = signal(false);
  protected currentPage = signal(1);

  protected selectedCategory = signal<
    'all' | 'fiction' | 'science' | 'classics'
  >('all');

  protected selectCategory(
    category: 'all' | 'fiction' | 'science' | 'classics'
  ): void {
    if (this.selectedCategory() === category) {
      return;
    }

    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.loadBooks();
  }

  protected nextPage(): void {
    this.currentPage.update(page => page + 1);
    this.loadBooks();
  }

  protected previousPage(): void {
    if (this.currentPage() === 1) {
      return;
    }

    this.currentPage.update(page => page - 1);
    this.loadBooks();
  }

  protected loadBooks(): void {
    const category = this.selectedCategory();
    const page = this.currentPage();

    this.isLoading.set(true);

    const request$ = category === 'all'
      // forkJoin executes two or more Observables in parallel 
      // and gathers the results when each of them accomplishes its task(s)
      // it's quite helpful to manage Angular's HTTP requests
      ? forkJoin([
          this.httpBookService.getBooksBySubject('fiction', page),
          this.httpBookService.getBooksBySubject('science', page),
          this.httpBookService.getBooksBySubject('classics', page)
        ]).pipe(
          // map() transforms the data emitted by an Observable without modifying the source
          // in this case it takes the data gathered by forkJoin and puts them in one array
          map(([fiction, science, classics]) => [
            ...fiction,
            ...science,
            ...classics
          ])
        )
      : this.httpBookService.getBooksBySubject(category, page);

    request$.subscribe({
      next: (books) => {
        const uniqueBooks = [
          ...new Map(
            books.map(book => [book.key, book] as const)
          ).values()
        ];

        this.books.set(uniqueBooks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading preview books:', error);
        this.books.set([]);
        this.isLoading.set(false);
      }
    });
  }
  ngOnInit(): void {
    this.loadBooks();
  }
}