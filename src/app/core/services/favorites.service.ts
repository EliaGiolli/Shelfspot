import { Injectable, signal } from "@angular/core";
import { type Book } from "../../shared/types/book";

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private favoritesSignal = signal<Book[]>(this.loadFromStorage());

  favorites = this.favoritesSignal.asReadonly();

  toggleFavorite(book: Book) {
    this.favoritesSignal.update(list => {
      const exists = list.find(b => b.id === book.id);
      const newList = exists ? list.filter(b => b.id !== book.id) : [...list, book];
      localStorage.setItem('shelfspot_favs', JSON.stringify(newList));
      return newList;
    });
  }

  private loadFromStorage(): Book[] {
    const data = localStorage.getItem('shelfspot_favs');
    if (!data) {
      return [];
    }

    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(isStoredBook);
    } catch {
      return [];
    }
  }

  isFavorite(book: Book): boolean {
    return this.favorites().some(b => b.id === book.id);
  }
}

function isStoredBook(value: unknown): value is Book {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const book = value as Book;
  return typeof book.id === 'string' && Array.isArray(book.authors);
}
