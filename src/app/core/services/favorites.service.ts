import { Inject, Injectable, signal } from '@angular/core';
import type { Book } from '../../shared/types/book';
import { type FavoritesRepository } from '../../features/favorites/repository/favorites.repository';
import { FAVORITES_REPOSITORY } from '../tokens/favorites-repository.token';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly favoritesSignal = signal<Book[]>([]);
  private readonly initialization: Promise<void>;
  private pendingOperation: Promise<void> = Promise.resolve();

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly isLoaded = signal(false);

  constructor(
    @Inject(FAVORITES_REPOSITORY)
    private readonly repository: FavoritesRepository
  ) {
    this.initialization = this.loadFavorites();
  }

  private async loadFavorites(): Promise<void> {
    try {
      const favorites = await this.repository.getAll();
      this.favoritesSignal.set(favorites);
    } catch (error) {
      console.error('Failed to load favorites.', error);
      this.favoritesSignal.set([]);
    } finally {
      this.isLoaded.set(true);
    }
  }

  toggleFavorite(book: Book): void {
    this.pendingOperation = this.pendingOperation
      .then(async () => {
        await this.initialization;

        const current = this.favoritesSignal();
        const exists = current.some(item => item.id === book.id);

        const updated = exists
          ? current.filter(item => item.id !== book.id)
          : [...current, book];

        await this.repository.saveAll(updated);
        this.favoritesSignal.set(updated);
      })
      .catch(error => {
        console.error('Failed to update favorites.', error);
      });
  }

  isFavorite(book: Book): boolean {
    return this.favoritesSignal().some(item => item.id === book.id);
  }
}
