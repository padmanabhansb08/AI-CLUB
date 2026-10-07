import { API_URL } from '../services/apiConfig';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: any;

  constructor(message: string, status = 400, code = 'API_ERROR', details: any = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const API_BASE_URL = `${API_URL}/api`;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Format query params if present
  let url = `${API_BASE_URL}${cleanEndpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (networkError: any) {
    throw new ApiError(
      'Unable to connect to AI CLUB server. Please check your connection or server status.',
      0,
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }

  // Handle No Content (204)
  if (response.status === 204) {
    return {} as T;
  }

  let payload: any;
  try {
    payload = await response.json();
  } catch {
    payload = {
      success: response.ok,
      error: {
        code: 'PARSE_ERROR',
        message: `Server returned HTTP ${response.status} with invalid JSON`,
      },
    };
  }

  if (!response.ok || payload.success === false) {
    const errorObj = payload.error || {};
    const code = errorObj.code || (response.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR');
    const message = errorObj.message || payload.message || `Request failed with HTTP ${response.status}`;

    // On 401 Unauthorized, dispatch event for auth listeners
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('aiclub:unauthorized'));
    }

    throw new ApiError(message, response.status, code, errorObj.details);
  }

  // If response matches standardized { success: true, data: ... }, extract data
  if (payload.data !== undefined) {
    if (payload.pagination !== undefined) {
      return { data: payload.data, pagination: payload.pagination } as T;
    }
    return payload.data as T;
  }
  return payload as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  getBaseUrl: () => API_BASE_URL,
};

export const client = apiClient;
