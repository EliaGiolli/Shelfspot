
import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpRequest,
    HttpResponse,
  } from '@angular/common/http';
  import { describe, expect, it } from 'vitest';
  import { firstValueFrom, of, throwError } from 'rxjs';
  
  import { httpErrorInterceptor } from './http-error.interceptor';
  import { ApiError } from '../errors/api-error';
  
  describe('httpErrorInterceptor', () => {
    const request = new HttpRequest('GET', '/test');
  
    it('should convert network errors into ApiError', async () => {
      const networkError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
      });
  
      const next: HttpHandlerFn = () =>
        throwError(() => networkError);
  
      const result = firstValueFrom(
        httpErrorInterceptor(request, next)
      );
  
      await expect(result).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Unable to connect to the server.',
        type: 'network',
        status: undefined,
      });
    });
  
    it('should convert HTTP errors into ApiError preserving the status', async () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
      });
  
      const next: HttpHandlerFn = () =>
        throwError(() => httpError);
  
      const result = firstValueFrom(
        httpErrorInterceptor(request, next)
      );
  
      await expect(result).rejects.toMatchObject({
        name: 'ApiError',
        type: 'http',
        status: 404,
        message: httpError.message,
      });
    });
  
    it('should convert unexpected errors into ApiError', async () => {
      const unexpectedError = new Error('Unexpected failure');
  
      const next: HttpHandlerFn = () =>
        throwError(() => unexpectedError);
  
      const result = firstValueFrom(
        httpErrorInterceptor(request, next)
      );
  
      await expect(result).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An unexpected error occurred.',
        type: 'unknown',
        status: undefined,
      });
    });
  
    it('should forward successful HTTP responses unchanged', async () => {
      const response = new HttpResponse({
        status: 200,
        body: 'success',
      });
  
      const next: HttpHandlerFn = () => of(response);
  
      const result = await firstValueFrom(
        httpErrorInterceptor(request, next)
      );
  
      expect(result).toBe(response);
    });
  });
  