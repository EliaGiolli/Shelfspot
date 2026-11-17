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

@Component({
  selector: 'app-book-preview',
  standalone: true,
  imports: [CardComponent, RouterLink],
  templateUrl: './book-preview.html',
  styleUrl: './book-preview.css'
})
export class BookPreview implements OnInit{
  private httpBookService = inject(HttpBookService);

  protected books = signal<BookSearchResult[]>([]);
  protected isLoading = signal(false);
  protected currentPage = signal(1);

  protected selectedCategory = signal<
    'all' | 'fiction' | 'science' | 'classics'
  >('all');

  protected loadBooks(): void {
    this.isLoading.set(true);

    this.httpBookService.getBooksBySubject('fiction', this.currentPage())
      .subscribe({
        next: (books) => {
          this.books.set(books);
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