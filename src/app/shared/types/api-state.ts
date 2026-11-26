// Defines the possible states of an API request and its associated data.
export type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: string }
  | { status: 'not-found' };
