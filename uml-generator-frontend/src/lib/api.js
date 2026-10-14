const BASE_URL = 'http://localhost:3001/api';

/**
 * Core API fetch wrapper to communicate with the NestJS backend.
 * @param {string} endpoint - The API route (e.g., '/auth/login', '/uml/generate')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 */
export async function apiRequest(endpoint, options = {}) {
  // 1. Get the auth token from local storage if the user is logged in
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 2. Build default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // 3. Clean up the config configuration
  const config = {
    ...options,
    headers,
  };

  // If there's a body and it's an object, stringify it
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // 4. Handle HTTP error statuses (400, 401, 403, 500, etc.)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'An unexpected server error occurred.';
      
      // If the token is invalid or expired, clear it out
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
      throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }

    // 5. If response is empty (like a 204 No Content), don't try to parse JSON
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}