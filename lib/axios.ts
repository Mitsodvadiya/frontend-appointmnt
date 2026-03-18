import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '@/store/use-app-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent infinite 401 loops
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    
    // Explicitly do not attach token for the refresh endpoint as requested
    if (url.includes('/auth/refresh')) {
      if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      return config;
    }

    // Get token from in-memory Zustand store and attach for other requests
    const token = useAppStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 Unauthorized and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't intercept auth endpoints like login or the refresh endpoint itself
      const url = originalRequest.url || '';
      if (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using HttpOnly cookie automatically
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.token;

        // Update in-memory store
        const currentUser = useAppStore.getState().user;
        if (currentUser && newToken) {
          useAppStore.getState().setAuth(currentUser, newToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);
        return await apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed, user is actually logged out (cookie expired/invalid)
        useAppStore.getState().logout();

        // Optional: Trigger a router redirect to /login here if outside React tree,
        // but typically handled by AuthGuard watching the store.

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
