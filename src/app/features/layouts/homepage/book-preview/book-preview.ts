import { Component, inject, signal } from '@angular/core';
import { HttpBookService } from '../../../../core/services/http-book.service';
import { type BookSearchResult } from '../../../../core/schemas/book-api.schema';
import { CardComponent } from '../../../../shared/components/card/card';

@Component({
  selector: 'app-book-preview',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './book-preview.html',
  styleUrl: './book-preview.css'
})
export class BookPreview {
  private httpBookService = inject(HttpBookService);

  protected books = signal<BookSearchResult[]>([]);
  protected isLoading = signal(false);
  protected currentPage = signal(1);

  protected selectedCategory = signal<
    'all' | 'fiction' | 'science' | 'classics'
  >('all');
}