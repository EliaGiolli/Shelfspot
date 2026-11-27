import { Inject, Injectable, signal } from '@angular/core';

import type { Book } from '../../shared/types/book';
import type { FavoritesRepository } from '../../features/favorites/repository/favorites.repository';

import { AppError } from '../errors/app-error';
import { FAVORITES_REPOSITORY } from '../tokens/favorites-repository.token';

export type FavoriteActionStatus = 'idle' | 'loading' | 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly favoritesSignal = signal<Book[]>([]);

  private readonly initialization: Promise<void>;
  private pendingOperation: Promise<void> = Promise.resolve();
  private operationSequence = 0;

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly isLoaded = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly favoriteActionStatus = signal<FavoriteActionStatus>('idle');
  readonly favoriteActionMessage = signal('');
  readonly favoriteActionError = signal<AppError | null>(null);

  constructor(
    @Inject(FAVORITES_REPOSITORY)
    private readonly repository: FavoritesRepository
  ) {
    this.initialization = this.loadFavorites();
  }

  private async loadFavorites(): Promise<void> {
    this.isLoaded.set(false);
    this.loadError.set(null);

    try {
      const favorites = await this.repository.getAll();
      this.favoritesSignal.set(favorites);
    } catch (error) {
      const appError = new AppError(
        'Unable to load your favorites. Please try again.',
        'storage',
        error
      );

      console.error(appError);

      this.favoritesSignal.set([]);
      this.loadError.set(appError.message);
    } finally {
      this.isLoaded.set(true);
    }
  }

  toggleFavorite(book: Book): Promise<boolean> {
    const operationId = ++this.operationSequence;

    this.favoriteActionStatus.set('loading');
    this.favoriteActionMessage.set('');
    this.favoriteActionError.set(null);

    const operation = this.pendingOperation.then(async () => {
      try {
        await this.initialization;

        if (this.loadError()) {
          throw new AppError(
            'Favorite data could not be loaded.',
            'storage'
          );
        }

        const current = this.favoritesSignal();
        const exists = current.some(item => item.id === book.id);

        const updated = exists
          ? current.filter(item => item.id !== book.id)
          : [...current, book];

        await this.repository.saveAll(updated);
        this.favoritesSignal.set(updated);

        if (operationId === this.operationSequence) {
          this.favoriteActionStatus.set('success');
          this.favoriteActionMessage.set(
            exists
              ? `${book.title} has been removed from favorites.`
              : `${book.title} has been added to favorites.`
          );
        }

        return true;
      } catch (error) {
        const appError = error instanceof AppError
          ? error
          : new AppError(
              'Unable to update favorites. Please try again.',
              'storage',
              error
            );

        console.error(appError);

        if (operationId === this.operationSequence) {
          this.favoriteActionStatus.set('error');
          this.favoriteActionMessage.set(
            'Unable to update favorites. Please try again.'
          );
          this.favoriteActionError.set(appError);
        }

        return false;
      }
    });

    this.pendingOperation = operation.then(() => undefined);

    return operation;
  }

  isFavorite(book: Book): boolean {
    return this.favoritesSignal().some(
      item => item.id === book.id
    );
  }
}
