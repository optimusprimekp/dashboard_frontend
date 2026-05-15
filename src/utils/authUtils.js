/**
 * Safe read of token from sessionStorage.
 * Prevents crash when token is missing or invalid JSON.
 * @returns {string|object|null} Parsed token or null
 */
export function getStoredToken() {
  try {
    const raw = sessionStorage.getItem("token");
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
