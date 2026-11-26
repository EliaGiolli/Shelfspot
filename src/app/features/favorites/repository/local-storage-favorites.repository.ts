import { Injectable } from '@angular/core';
import type { Book } from '../../../shared/types/book';
import type { FavoritesRepository } from './favorites.repository';

const STORAGE_KEY = 'shelfspot_favs';

@Injectable({
    providedIn: 'root'
})

export class LocalStorageFavoritesRepository implements FavoritesRepository {

    async getAll(): Promise<Book[]> {
        
        const data = localStorage.getItem(STORAGE_KEY);

        if (data === null) {
            return [];
        }

        const parsed: unknown = JSON.parse(data);

        if (!Array.isArray(parsed)) {
            throw new Error('Stored favorites must be an array.');
        }

            // Full book validation will be added in TASK-417.
        return parsed as Book[];
    }

    async saveAll(favorites: Book[]): Promise<void> {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
}