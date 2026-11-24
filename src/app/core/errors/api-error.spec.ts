
import { describe, expect, it } from 'vitest';

import { ApiError } from './api-error';

describe('ApiError', () => {
  it('should create an instance of ApiError', () => {
    const error = new ApiError('Request failed.', 'http', 500);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Request failed.');
  });

  it('should preserve the error type', () => {
    const error = new ApiError('Connection failed.', 'network');

    expect(error.type).toBe('network');
  });

  it('should preserve the HTTP status code', () => {
    const error = new ApiError('Not found.', 'http', 404);

    expect(error.status).toBe(404);
  });

  it('should preserve error details', () => {
    const details = [{ code: 'invalid_type', path: ['title'] }];
    const error = new ApiError('Invalid response.', 'validation', undefined, details);

    expect(error.details).toEqual(details);
  });

  it('should allow optional status and details', () => {
    const error = new ApiError('Unexpected error.', 'unknown');

    expect(error.status).toBeUndefined();
    expect(error.details).toBeUndefined();
  });
});
