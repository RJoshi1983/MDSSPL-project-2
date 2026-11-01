export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Turn a database error into a clear message for the person using the app. */
export function dbError(error: { message?: string; code?: string }): HttpError {
  const msg = error.message || 'Database error.';
  // P0001 = a rule in schema.sql said no; 42501 = row-level security said no
  if (error.code === 'P0001' || error.code === '42501') return new HttpError(403, msg);
  return new HttpError(500, msg);
}
