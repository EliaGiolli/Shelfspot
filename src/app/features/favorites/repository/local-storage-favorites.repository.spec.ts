import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '../../../shared/types/book';
import { LocalStorageFavoritesRepository } from './local-storage-favorites.repository';

describe('LocalStorageFavoritesRepository', () => {
  let repository: LocalStorageFavoritesRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageFavoritesRepository();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return an empty array when storage has no favorites', async () => {
    await expect(repository.getAll()).resolves.toEqual([]);
  });

  it('should read and parse stored favorites', async () => {
    const storedFavorites = [{ id: 'book-1', title: 'Test book' }];
    localStorage.setItem('shelfspot_favs', JSON.stringify(storedFavorites));

    await expect(repository.getAll()).resolves.toEqual(storedFavorites);
  });

  it('should throw when stored favorites are not an array', async () => {
    localStorage.setItem('shelfspot_favs', JSON.stringify({ id: 'book-1' }));

    await expect(repository.getAll()).rejects.toThrow(
      'Stored favorites must be an array.'
    );
  });

  it('should throw when stored data is invalid JSON', async () => {
    localStorage.setItem('shelfspot_favs', '{invalid json');

    await expect(repository.getAll()).rejects.toThrow();
  });

  it('should serialize favorites and save them to localStorage', async () => {
    const favorites = [
      { id: 'book-1', title: 'Test book' }
    ] as unknown as Book[];

    await repository.saveAll(favorites);

    expect(localStorage.getItem('shelfspot_favs')).toBe(
      JSON.stringify(favorites)
    );
  });

  it('should overwrite previously stored favorites', async () => {
    localStorage.setItem(
      'shelfspot_favs',
      JSON.stringify([{ id: 'old-book' }])
    );

    const favorites = [{ id: 'new-book' }] as unknown as Book[];
    await repository.saveAll(favorites);

    expect(localStorage.getItem('shelfspot_favs')).toBe(
      JSON.stringify(favorites)
    );
  });
});