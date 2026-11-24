import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../errors/api-error';

// Intercepts HTTP errors and converts them into standardized ApiError instances.
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // A status of 0 indicates a network or connection-level failure.
        if (error.status === 0) {
          return throwError(() =>
            new ApiError(
              'Unable to connect to the server.',
              'network'
            )
          );
        }

        // Preserve the HTTP status code for further error handling.
        return throwError(() =>
          new ApiError(
            error.message,
            'http',
            error.status
          )
        );
      }

      // Handle unexpected errors that are not HTTP-related.
      return throwError(() =>
        new ApiError(
          'An unexpected error occurred.',
          'unknown'
        )
      );
    })
  );
};
