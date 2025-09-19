import axios, { type AxiosError } from 'axios';
import { API_BASE } from './config';

// The original HttpError class is kept for consistency with the rest of the app.
export class HttpError<T = unknown> extends Error {
  status: number;
  data: T | undefined;
  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

// --- Axios Implementation ---

// Create a central axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Use an interceptor to dynamically add the Authorization header to requests.
// This is the "axios way" of doing what `withAuthHeaders` did.
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Use a response interceptor to standardize error handling.
// This catches errors from axios and converts them into the HttpError class your app expects.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    const message = (error.response?.data as any)?.message || error.message;
    const data = error.response?.data;
    return Promise.reject(new HttpError(message, status, data));
  }
);

// --- API Wrapper ---

// This `api` object has the exact same methods as before, so no other files need to change.
export const api = {
  get: <T>(path: string) => axiosInstance.get<T>(path).then((res) => res.data),
  post: <T, B = unknown>(path: string, body?: B) => axiosInstance.post<T>(path, body).then((res) => res.data),
  put: <T, B = unknown>(path: string, body?: B) => axiosInstance.put<T>(path, body).then((res) => res.data),
  patch: <T, B = unknown>(path:string, body?: B) => axiosInstance.patch<T>(path, body).then(res => res.data),
  delete: <T>(path: string) => axiosInstance.delete<T>(path).then((res) => res.data),
};

// --- Other Functions (Unchanged Public Interface) ---

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('auth.token', token);
    } else {
      localStorage.removeItem('auth.token');
    }
  } catch {}
}

// Special case for presigned uploads: use a separate axios call
// that does NOT include the Authorization header.
export async function uploadFile(
  url: string,
  file: File,
  signal?: AbortSignal // <-- NEW
): Promise<boolean> {
  try {
    await axios.put(url, file, {
      headers: { 'Content-Type': file.type },
      signal, // <-- pass AbortSignal through to axios
    });
    return true;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = `File upload failed: ${error.message}`;
    throw new HttpError(message, status);
  }
}
