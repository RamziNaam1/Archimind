import { apiRequest } from "./api"

/**
 * Logs the user into the NestJS backend and saves the JWT token dynamically.
 * @param {string} email 
 * @param {string} password 
 */
export async function login(email, password) {
  // 1. Hit her live backend controller endpoint
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }, // Sends the login payload her DTO expects
  });

  console.log("Raw login response received from NestJS:", data);

  // 2. Flexible Token Extraction (Handles camelCase, snake_case, or flat token keys)
  const token = data?.accessToken || data?.access_token || data?.token || (typeof data === 'string' ? data : null);

  if (!token) {
    throw new Error("Login failed: No session token returned from the server.");
  }

  localStorage.setItem("token", token);

  // 3. User Resolution
  // If her response includes a nested user object, use it; otherwise, build a fallback layout
  const userProfile = data?.user || {
    id: data?.id || "user-session",
    email: email,
    firstName: data?.firstName || "User",
    lastName: data?.lastName || "",
    role: data?.role || "user"
  };

  localStorage.setItem("user", JSON.stringify(userProfile));
  return userProfile;
}

/**
 * Inscription d'un nouvel utilisateur avec un objet de données.
 * @param {Object} userData - L'objet contenant les infos d'inscription
 */
export async function register(userData) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password
    }, // Envoie exactement ce que le DTO attend
  });

  console.log("Raw register response received from NestJS:", data);

  // Extract token dynamically on registration if her backend automatically logs them in
  const token = data?.accessToken || data?.access_token || data?.token;
  if (token) {
    localStorage.setItem("token", token);
  }
  
  // Resolve user info safely from registration payload response
  const userProfile = data?.user || {
    id: data?.id || "new-user-session",
    email: userData.email,
    firstName: data?.firstName || userData.firstName,
    lastName: data?.lastName || userData.lastName,
    role: data?.role || "user"
  };

  localStorage.setItem("user", JSON.stringify(userProfile));
  return userProfile;
}

/**
 * Retrieves the currently cached session user profile from localStorage.
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * Logs out the user by clearing local session tracking tokens.
 */
export async function logout() {
  try {
    // Optional: Call her logout backend endpoint to invalidate refresh tokens
    await apiRequest("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Backend logout failed, clearing local storage anyway:", error.message);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
}