
/**
 * Represents a standardized application-level error across services and features.
 */

export type AppErrorType =
  | 'network'
  | 'http'
  | 'validation'
  | 'storage'
  | 'unknown';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly type: AppErrorType,
    public readonly originalError?: unknown
  ) {
    super(message);

    this.name = 'AppError';
  }
}
