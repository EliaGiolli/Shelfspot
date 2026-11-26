import { InjectionToken } from "@angular/core";
import { FavoritesRepository } from "../../features/favorites/repository/favorites.repository";

export const FAVORITES_REPOSITORY = new InjectionToken<FavoritesRepository>(
  'FAVORITES_REPOSITORY'
);