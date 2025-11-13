/**
 * Token Service
 * Handles JWT token fetching from the backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/**
 * Fetches a fresh JWT token from the backend
 * @returns {Promise<{token: string, expiresIn: string, payload: object}>}
 * @throws {Error} If token generation fails
 */
export const generateToken = async () => {
  try {
    console.log('🎫 Fetching fresh JWT token from backend...');

    const response = await fetch(`${BACKEND_URL}/generate-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Token generation failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('No token received from backend');
    }

    console.log('✓ JWT token received successfully');
    console.log('  Expires in:', data.expiresIn);
    console.log('  Partner ID:', data.payload?.partnerId);

    return data;
  } catch (error) {
    console.error('✗ Token generation failed:', error);

    // Provide user-friendly error messages
    if (error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${BACKEND_URL}. Make sure the backend is running.`
      );
    }

    throw error;
  }
};

/**
 * Verifies if a token is valid (optional, for testing)
 * @param {string} token - JWT token to verify
 * @returns {Promise<{valid: boolean, payload?: object, error?: string}>}
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      valid: false,
      error: error.message,
    };
  }
};

export default {
  generateToken,
  verifyToken,
};
