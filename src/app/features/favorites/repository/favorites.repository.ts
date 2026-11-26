import type { Book } from '../../../shared/types/book';

// This repository now handles the persistance in the localStorage, but later on will handle Supabase
export interface FavoritesRepository {
  getAll(): Promise<Book[]>;
  saveAll(favorites: Book[]): Promise<void>;
}