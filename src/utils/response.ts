/**
 * @param error
 * @param data should be a string if error is true
 */
export function packResponse(error: boolean, data: any) {
  return {
    data,
    error,
  };
}
