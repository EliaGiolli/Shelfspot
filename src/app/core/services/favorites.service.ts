
import { Inject, Injectable, signal } from '@angular/core';
import type { Book } from '../../shared/types/book';
import type { FavoritesRepository } from '../../features/favorites/repository/favorites.repository';
import { FAVORITES_REPOSITORY } from '../tokens/favorites-repository.token';

export type FavoriteActionStatus = 'idle' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly favoritesSignal = signal<Book[]>([]);
  private readonly initialization: Promise<void>;
  private pendingOperation: Promise<void> = Promise.resolve();

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly isLoaded = signal(false);

  readonly favoriteActionStatus = signal<FavoriteActionStatus>('idle');
  readonly favoriteActionMessage = signal('');

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
    } finally {
      this.isLoaded.set(true);
    }
  }

  toggleFavorite(book: Book): Promise<boolean> {
    this.favoriteActionStatus.set('idle');
    this.favoriteActionMessage.set('');

    const operation = this.pendingOperation.then(async () => {
      await this.initialization;

      const current = this.favoritesSignal();
      const exists = current.some(item => item.id === book.id);

      const updated = exists
        ? current.filter(item => item.id !== book.id)
        : [...current, book];

      try {
        await this.repository.saveAll(updated);
        this.favoritesSignal.set(updated);

        this.favoriteActionStatus.set('success');
        this.favoriteActionMessage.set(
          exists ? 'Removed from favorites.' : 'Added to favorites.'
        );

        return true;
      } catch (error) {
        console.error('Failed to update favorites.', error);

        this.favoriteActionStatus.set('error');
        this.favoriteActionMessage.set(
          'Unable to update favorites. Please try again.'
        );

        return false;
      }
    });

    this.pendingOperation = operation.then(() => undefined);
    return operation;
  }

  isFavorite(book: Book): boolean {
    return this.favoritesSignal().some(item => item.id === book.id);
  }
}
