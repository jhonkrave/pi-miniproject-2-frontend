/**
 * User data type definition for LumiFlix - mini project 2
 * 
 * Represents the complete user profile structure used throughout the application.
 * This type is used for user registration, authentication, profile management,
 * and API communication between the frontend and backend services.
 * 
 * @typedef {Object} User
 * @property {string} id - Unique identifier for the user account
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {number} age - User's age (minimum 13 years)
 * @property {string} email - User's email address (unique identifier)
 * @property {string} createdAt - ISO timestamp of account creation
 * @property {string} [updatedAt] - ISO timestamp of last profile update (optional)
 * 
 * @since 1.0.0
 */
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  createdAt: string;
  updatedAt?: string;
};

/**
 * Movie and catalog related types for Sprint 2
 * @since 2.0.0
 */
export type MovieGenre = { id: number; name: string };
export type MovieItem = {
  id: number;
  title: string;
  year?: number;
  poster?: string;
  backdrop?: string;
  overview?: string;
  voteAverage?: number;
  genres?: MovieGenre[];
  genreIds?: number[];
};
export type PagedMovies = {
  page: number;
  total_pages: number;
  total_results: number;
  results: MovieItem[];
};
export type WatchResponse = {
  movie: MovieItem;
  video: any;
  provider: 'pexels';
};

/**
 * Global type declaration for Vite environment variables
 * 
 * Extends the ImportMeta interface to include custom environment variables
 * used for API configuration in the LumiFlix application.
 * 
 * @since 1.0.0
 */
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE_URL?: string;
    };
  }
}

/**
 * API base URL configuration for LumiFlix - mini project 2
 * 
 * Determines the base URL for all API requests. Uses the VITE_API_BASE_URL
 * environment variable if available, otherwise defaults to '/api' for
 * relative API endpoints.
 * 
 * @constant {string} BASE_URL
 * @since 1.0.0
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

/**
 * Builds a complete API URL by combining the base URL with the provided path
 * 
 * Constructs a properly formatted API endpoint URL by:
 * - Normalizing the base URL by removing trailing slashes
 * - Ensuring the path starts with a forward slash
 * - Combining base URL and path into a complete endpoint URL
 * - Providing helpful development warnings when environment variables are missing
 * 
 * @param {string} path - The API endpoint path (e.g., '/auth/login', 'users/me')
 * @returns {string} Complete API URL ready for HTTP requests
 * 
 * @example
 * ```typescript
 * buildUrl('/auth/login') // Returns: 'https://api.example.com/auth/login'
 * buildUrl('users/me')    // Returns: 'https://api.example.com/users/me'
 * ```
 * 
 * @since 1.0.0
 */
function buildUrl(path: string): string {
  const base = (BASE_URL || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!BASE_URL) {
    // Helpful hint during local dev if env is missing
    // eslint-disable-next-line no-console
    console.warn('[api] VITE_API_BASE_URL is not set. Using http://localhost:3000/api');
  }
  return `${base}${p}`;
}

// ===== Internal normalizers (defensive to backend variations) =====
function toPosterUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function toBackdropUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `https://image.tmdb.org/t/p/original${path}`;
}

function normalizeMovieItem(raw: any): MovieItem {
  const id = Number(raw?.id ?? raw?.movieId ?? 0);
  const title = String(raw?.title ?? raw?.name ?? '');
  const year = (() => {
    if (raw?.year) return Number(String(raw.year).slice(0, 4));
    const rd = raw?.releaseDate || raw?.release_date || raw?.first_air_date;
    return rd ? Number(String(rd).slice(0, 4)) : undefined;
  })();
  const poster = raw?.poster ?? raw?.posterUrl ?? toPosterUrl(raw?.poster_path);
  const backdrop = raw?.backdrop ?? raw?.backdropUrl ?? toBackdropUrl(raw?.backdrop_path);
  const overview = raw?.overview;
  const voteAverage = typeof raw?.vote_average === 'number' ? raw?.vote_average : undefined;
  const genres = raw?.genres;
  const genreIds = Array.isArray(raw?.genreIds) ? raw.genreIds as number[] : undefined;
  return { id, title, year, poster, backdrop, overview, voteAverage, genres, genreIds } as MovieItem;
}

function normalizeMoviesList(data: any): PagedMovies {
  // Accept shapes: { results: [...] }, { movies: [...] }, direct array, or empty
  const arr = Array.isArray(data) ? data
    : (Array.isArray(data?.results) ? data.results
    : (Array.isArray(data?.movies) ? data.movies : []));
  const page = Number(data?.page || 1);
  const total_pages = Number(data?.total_pages || (data?.totalPages || 1));
  const total_results = Number(data?.total_results || (arr?.length ?? 0));
  const results = (arr || []).map(normalizeMovieItem);
  return { page, total_pages, total_results, results };
}

/**
 * Generic HTTP client function for API communication in LumiFlix - mini project 2
 * 
 * Provides a robust HTTP client with comprehensive error handling, timeout management,
 * and debugging capabilities. This function serves as the foundation for all API
 * communication in the application, ensuring consistent request/response handling.
 * 
 * **Key Features:**
 * - Generic type support for type-safe API responses
 * - Automatic timeout handling with configurable timeouts per endpoint type
 * - Comprehensive error handling with detailed error messages
 * - Debug logging for password-related endpoints (forgot/reset/verify)
 * - Automatic JSON parsing with fallback handling
 * - Proper CORS configuration for different endpoint types
 * - Request abort controller for timeout management
 * 
 * **Timeout Configuration:**
 * - Password endpoints: 60 seconds (longer for email processing)
 * - Other endpoints: 15 seconds (standard timeout)
 * 
 * **Error Handling:**
 * - Network errors: Custom error messages with status 0
 * - HTTP errors: Parsed error messages from API responses
 * - Timeout errors: AbortError handling with user-friendly messages
 * - JSON parsing errors: Graceful fallback to undefined
 * 
 * @template T - The expected response type from the API
 * @param {string} path - The API endpoint path
 * @param {RequestInit} [init] - Optional fetch configuration options
 * @returns {Promise<T>} Promise that resolves to the API response data
 * 
 * @throws {Object} Error object with status and message properties
 * 
 * @example
 * ```typescript
 * // GET request
 * const user = await http<User>('/auth/users/me');
 * 
 * // POST request
 * const result = await http<{user: User}>('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password })
 * });
 * ```
 * 
 * @since 1.0.0
 */
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const method = (init?.method || 'GET').toString();
  const shouldDebug = (path.includes('/auth/password/forgot') || path.includes('/auth/password/reset') || path.includes('/auth/password/verify'));
  const startedAt = Date.now();
  if (shouldDebug) {
    // eslint-disable-next-line no-console
    console.log('[api:http] ->', method, url);
  }
  const controller = new AbortController();
  const timeoutMs = path.includes('/auth/password/') ? 60000 : 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, {
      // Avoid sending cookies for public endpoints to reduce CORS/preflight issues
      credentials: path.includes('/auth/password/') ? 'omit' : 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      signal: controller.signal,
      ...init,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (shouldDebug) {
      // eslint-disable-next-line no-console
      console.error('[api:http] network error <-', err?.message || err);
    }
    throw { status: 0, message: err?.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Error de red' } as { status: number; message: string };
  }
  clearTimeout(timeoutId);
  if (shouldDebug) {
    // eslint-disable-next-line no-console
    console.log('[api:http] <-', res.status, res.statusText, `${Date.now() - startedAt}ms`);
  }
  // Accept 2xx status codes including 202 (Accepted)
  if (res.status < 200 || res.status >= 300) {
    // Try to parse error message
    let message = 'Error inesperado';
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* ignore */
    }
    throw { status: res.status, message } as { status: number; message: string };
  }
  // 204 no content
  if (res.status === 204) return undefined as unknown as T;
  try {
    const json = (await res.json()) as T;
    if (shouldDebug) {
      // eslint-disable-next-line no-console
      console.log('[api:http] body <-', json);
    }
    return json;
  } catch {
    // No JSON body (e.g., 204), just return undefined
    return undefined as unknown as T;
  }
}

/**
 * API service object for LumiFlix - mini project 2
 * 
 * Provides a comprehensive set of methods for all API communication including
 * user authentication, profile management, and password recovery operations.
 * All methods are type-safe and include proper error handling.
 * 
 * @namespace api
 * @since 1.0.0
 */
export const api = {
  /**
   * Creates a new user account in the LumiFlix platform
   * 
   * Registers a new user with the provided personal information and credentials.
   * The method normalizes field names to match backend expectations (firstName/lastName -> firstname/lastname).
   * 
   * @param {Object} payload - User registration data
   * @param {string} payload.firstName - User's first name
   * @param {string} payload.lastName - User's last name
   * @param {number} payload.age - User's age (minimum 13 years)
   * @param {string} payload.email - User's email address (must be unique)
   * @param {string} payload.password - User's password (must meet strength requirements)
   * @returns {Promise<{user: User}>} Promise that resolves to the created user data
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 409: Email already exists
   * - Status 400: Validation errors
   * 
   * @example
   * ```typescript
   * const result = await api.signup({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   age: 25,
   *   email: 'john@example.com',
   *   password: 'SecurePass123!'
   * });
   * ```
   * 
   * @since 1.0.0
   */
  signup(payload: { firstName: string; lastName: string; age: number; email: string; password: string }) {
    // backend expects firstname/lastname keys; normalize here
    const body = {
      firstname: payload.firstName,
      lastname: payload.lastName,
      age: payload.age,
      email: payload.email,
      password: payload.password,
    };
    return http<{ user: User }>(`/auth/signup`, { method: 'POST', body: JSON.stringify(body) });
  },

  /**
   * Authenticates a user and returns user data
   * 
   * Validates user credentials and returns the authenticated user's information
   * if login is successful. Sets authentication cookies for subsequent requests.
   * 
   * @param {Object} payload - Login credentials
   * @param {string} payload.email - User's email address
   * @param {string} payload.password - User's password
   * @returns {Promise<{user: User}>} Promise that resolves to the authenticated user data
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 401: Invalid credentials
   * - Status 400: Validation errors
   * 
   * @example
   * ```typescript
   * const result = await api.login({
   *   email: 'user@example.com',
   *   password: 'userpassword'
   * });
   * ```
   * 
   * @since 1.0.0
   */
  login(payload: { email: string; password: string }) {
    return http<{ user: User }>(`/auth/login`, { method: 'POST', body: JSON.stringify(payload) });
  },

  /**
   * Logs out the current user and clears authentication
   * 
   * Invalidates the user's session and clears authentication cookies.
   * This method should be called when the user wants to end their session.
   * 
   * @returns {Promise<{message: string}>} Promise that resolves to a confirmation message
   * 
   * @throws {Object} Error object with status and message properties
   * 
   * @example
   * ```typescript
   * await api.logout();
   * ```
   * 
   * @since 1.0.0
   */
  logout() {
    return http<{ message: string }>(`/auth/logout`, { method: 'POST' });
  },

  /**
   * Retrieves the current user's profile information
   * 
   * Fetches the complete user profile for the currently authenticated user.
   * Requires valid authentication session.
   * 
   * @returns {Promise<User>} Promise that resolves to the user's profile data
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 401: Not authenticated
   * 
   * @example
   * ```typescript
   * const user = await api.getProfile();
   * ```
   * 
   * @since 1.0.0
   */
  getProfile() {
    return http<User>(`/auth/users/me`, { method: 'GET' });
  },

  /**
   * Updates the current user's profile information
   * 
   * Modifies the user's profile data with the provided information.
   * The method normalizes field names to match backend expectations.
   * 
   * @param {Object} payload - Updated profile data
   * @param {string} payload.firstName - Updated first name
   * @param {string} payload.lastName - Updated last name
   * @param {number} payload.age - Updated age (minimum 13 years)
   * @param {string} payload.email - Updated email address (must be unique)
   * @param {string} [payload.password] - Optional new password
   * @returns {Promise<User>} Promise that resolves to the updated user data
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 409: Email already exists
   * - Status 401: Not authenticated
   * - Status 400: Validation errors
   * 
   * @example
   * ```typescript
   * const updatedUser = await api.updateProfile({
   *   firstName: 'Jane',
   *   lastName: 'Smith',
   *   age: 26,
   *   email: 'jane@example.com',
   *   password: 'NewSecurePass123!'
   * });
   * ```
   * 
   * @since 1.0.0
   */
  updateProfile(payload: { firstName: string; lastName: string; age: number; email: string; password?: string }) {
    const body: any = {
      firstname: payload.firstName,
      lastname: payload.lastName,
      age: payload.age,
      email: payload.email,
    };
    
    // Add password to body if provided
    if (payload.password) {
      body.password = payload.password;
    }
    
    return http<User>(`/auth/users/me`, { method: 'PUT', body: JSON.stringify(body) });
  },

  /**
   * Permanently deletes the current user's account
   * 
   * Removes the user's account and all associated data from the system.
   * This action is irreversible and requires confirmation.
   * 
   * @param {Object} payload - Account deletion confirmation
   * @param {string} payload.password - User's current password for verification
   * @param {string} payload.confirmation - Confirmation text (typically 'ELIMINAR')
   * @returns {Promise<void>} Promise that resolves when account is deleted
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 401: Not authenticated or invalid password
   * - Status 400: Invalid confirmation
   * 
   * @example
   * ```typescript
   * await api.deleteMe({
   *   password: 'currentpassword',
   *   confirmation: 'ELIMINAR'
   * });
   * ```
   * 
   * @since 1.0.0
   */
  deleteMe(payload: { password: string; confirmation: string }) {
    return http<void>(`/auth/users/me`, { method: 'DELETE', body: JSON.stringify(payload) });
  },

  /**
   * Initiates password recovery process for a user
   * 
   * Sends a password reset email to the specified email address if an account exists.
   * Uses form-encoded data for compatibility with password reset endpoints.
   * 
   * @param {Object} payload - Password recovery request
   * @param {string} payload.email - Email address of the account to recover
   * @returns {Promise<{message: string}>} Promise that resolves to a confirmation message
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 404: Email not found
   * - Status 400: Invalid email format
   * 
   * @example
   * ```typescript
   * await api.forgotPassword({ email: 'user@example.com' });
   * ```
   * 
   * @since 1.0.0
   */
  forgotPassword(payload: { email: string }) {
    const form = new URLSearchParams();
    form.set('email', payload.email);
    return http<{ message: string }>(`/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  },

  /**
   * Verifies the validity of a password reset token
   * 
   * Checks whether a password reset token is valid and has not expired.
   * This should be called before allowing the user to reset their password.
   * 
   * @param {string} token - The password reset token to verify
   * @returns {Promise<{valid: boolean}>} Promise that resolves to token validity status
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 400: Invalid token format
   * 
   * @example
   * ```typescript
   * const result = await api.verifyResetToken(resetToken);
   * if (result.valid) {
   *   // Allow password reset
   * }
   * ```
   * 
   * @since 1.0.0
   */
  verifyResetToken(token: string) {
    return http<{ valid: boolean }>(`/auth/password/verify?token=${encodeURIComponent(token)}`, { method: 'GET' });
  },

  /**
   * Resets a user's password using a valid reset token
   * 
   * Updates the user's password using a valid password reset token.
   * The new password must meet the application's strength requirements.
   * 
   * @param {Object} payload - Password reset data
   * @param {string} payload.token - Valid password reset token
   * @param {string} payload.newPassword - New password (must meet strength requirements)
   * @returns {Promise<{message: string}>} Promise that resolves to a confirmation message
   * 
   * @throws {Object} Error object with status and message properties
   * - Status 400: Invalid token or weak password
   * - Status 410: Token expired
   * 
   * @example
   * ```typescript
   * await api.resetPassword({
   *   token: 'valid-reset-token',
   *   newPassword: 'NewSecurePass123!'
   * });
   * ```
   * 
   * @since 1.0.0
   */
  resetPassword(payload: { token: string; newPassword: string }) {
    const form = new URLSearchParams();
    form.set('token', payload.token);
    form.set('newPassword', payload.newPassword);
    return http<{ message: string }>(`/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  },

  // ===== Movies (Sprint 2) =====
  /**
   * Get genres list from TMDB via backend
   */
  getGenres(language?: string) {
    const qs = language ? `?language=${encodeURIComponent(language)}` : '';
    return http<{ genres: MovieGenre[] }>(`/movie/movies/genres${qs}`);
  },

  /**
   * Unified list endpoint: search (q), filter by genreId, or popular
   */
  async getMovies(params?: { q?: string; genreId?: string; page?: number; language?: string }): Promise<PagedMovies> {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.genreId) search.set('genreId', params.genreId);
    if (params?.page) search.set('page', String(params?.page || 1));
    if (params?.language) search.set('language', params.language);
    const qs = search.toString();
    const raw = await http<any>(`/movie/movies${qs ? `?${qs}` : ''}`);
    return normalizeMoviesList(raw);
  },

  /**
   * Get movie details by id
   */
  async getMovie(id: string | number, language?: string) {
    const qs = language ? `?language=${encodeURIComponent(language)}` : '';
    const raw = await http<any>(`/movie/movies/${id}${qs}`);
    const movie = normalizeMovieItem((raw as any)?.movie ?? raw);
    return { movie } as { movie: MovieItem };
  },

  /**
   * Resolve a playable video via Pexels for a movie id (auth required)
   */
  async watch(id: string | number, language?: string) {
    const qs = language ? `?language=${encodeURIComponent(language)}` : '';
    const r = await http<any>(`/movie/watch/${id}${qs}`);
    return { movie: normalizeMovieItem(r.movie), video: r.video, provider: r.provider } as WatchResponse;
  },

  /** Favorites (auth required) */
  addFavorite(movieId: string | number) {
    return http<{ _id: string; userId: string; movieId: string }>(`/movie/favorite`, {
      method: 'POST',
      body: JSON.stringify({ movieId: String(movieId) })
    });
  },
  removeFavorite(movieId: string | number) {
    return http<{ _id: string; userId: string; movieId: string }>(`/movie/favorite`, {
      method: 'DELETE',
      body: JSON.stringify({ movieId: String(movieId) })
    });
  },
  async getFavorites() {
    const raw = await http<{ movies: any[]; total: number }>(`/movie/favorites`);
    const movies = (raw.movies || []).map(normalizeMovieItem);
    return { movies, total: raw.total || 0 };
  },
};

/**
 * Validates email address format using comprehensive regex pattern
 * 
 * Checks if the provided email address follows a valid email format.
 * Uses a comprehensive regex pattern that supports most valid email formats
 * including international domains and special characters.
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email format is valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com');     // true
 * isValidEmail('invalid-email');        // false
 * isValidEmail('test+tag@domain.co.uk'); // true
 * ```
 * 
 * @since 1.0.0
 */
export function isValidEmail(email: string): boolean {
  const re = /^(?:[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+(?:\.[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return re.test(email);
}

/**
 * Validates password strength requirements
 * 
 * Checks if the provided password meets the application's security requirements:
 * - Minimum 8 characters in length
 * - Contains at least one lowercase letter (a-z)
 * - Contains at least one uppercase letter (A-Z)
 * - Contains at least one digit (0-9)
 * - Contains at least one special character or underscore
 * 
 * @param {string} pwd - The password to validate
 * @returns {boolean} True if the password meets all strength requirements, false otherwise
 * 
 * @example
 * ```typescript
 * isStrongPassword('SecurePass123!'); // true
 * isStrongPassword('weak');            // false
 * isStrongPassword('StrongPass1');    // true
 * ```
 * 
 * @since 1.0.0
 */
export function isStrongPassword(pwd: string): boolean {
  // 8+, lowercase, uppercase, digit, special
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);
}


