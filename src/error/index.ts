export class ServerError extends Error {
  constructor(
    msg: string = "An unknown error occurred",
    public readonly statusCode = 500
  ) {
    super(msg);
  }
}

/**
 *
 * @returns @param error if is an instance of ServerError or creates
 * a new error from @param msg  of ServerError and returns that
 */

export function handleError(
  error: any,
  msg: string = "An unknown error occurred",
  statusCode: number = 500
) {
  if (error instanceof ServerError) return error;
  return new ServerError(msg, statusCode);
}
