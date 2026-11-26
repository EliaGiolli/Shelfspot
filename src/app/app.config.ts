
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { FAVORITES_REPOSITORY } from './core/tokens/favorites-repository.token';
import { LocalStorageFavoritesRepository } from './features/favorites/repository/local-storage-favorites.repository';
import { LOANS_REPOSITORY } from './core/tokens/loans-repository,token';
import { LocalStorageLoansRepository } from './features/loans/repository/local-storage-loans.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([httpErrorInterceptor])
    ),
    {
      provide: FAVORITES_REPOSITORY,
      useClass: LocalStorageFavoritesRepository
    },
    {
      provide: LOANS_REPOSITORY,
      useClass: LocalStorageLoansRepository,
    },
  ]
};
