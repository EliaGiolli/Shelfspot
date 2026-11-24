// Defines the possible categories of API errors.
export type ApiErrorType = 'network' | 'http' | 'validation' | 'unknown';
// Represents a standardized application-level API error.
export class ApiError extends Error {
  constructor(
    // The error message describing the specific issue.
    message: string,
    // The category of the error (e.g., network, http, unknown).
    public readonly type: ApiErrorType,
    // The HTTP status code associated with the error, if applicable.
    public readonly status?: number,
    // Zod validation error details, if applicable.
    public readonly details?: unknown
  ) {
    super(message);

    this.name = 'ApiError';
  }
}
