/**
 * Shared API response helpers for consistent success/error handling.
 */

/**
 * Returns true if the API response indicates success.
 * Handles both boolean (success) and HTTP status (200/201) from backend.
 * @param {object} res - Normalized response from ApiHandler
 * @returns {boolean}
 */
export function isSuccessResponse(res) {
  return (
    res?.status === true ||
    res?.status === 200 ||
    res?.status === 201
  );
}
