
import { describe, expect, it } from 'vitest';

import { AppError } from './app-error';

describe('AppError', () => {
  it('should create an AppError instance', () => {
    const error = new AppError('Something went wrong.', 'unknown');

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should preserve the error message', () => {
    const error = new AppError('Storage operation failed.', 'storage');

    expect(error.message).toBe('Storage operation failed.');
  });

  it('should set the error name', () => {
    const error = new AppError('Unexpected error.', 'unknown');

    expect(error.name).toBe('AppError');
  });

  it.each([
    'network',
    'http',
    'validation',
    'storage',
    'unknown'
  ] as const)('should preserve the %s error type', type => {
    const error = new AppError('Application error.', type);

    expect(error.type).toBe(type);
  });

  it('should preserve the original error', () => {
    const originalError = new Error('Original failure');

    const error = new AppError(
      'Storage operation failed.',
      'storage',
      originalError
    );

    expect(error.originalError).toBe(originalError);
  });

  it('should allow an undefined original error', () => {
    const error = new AppError('Unexpected error.', 'unknown');

    expect(error.originalError).toBeUndefined();
  });
});
