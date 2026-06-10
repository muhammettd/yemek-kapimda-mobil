import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { BASE_URL } from '@/src/constants/config';
import {
  clearStoredAuth,
  getStoredToken,
  removeStoredToken,
  saveStoredToken,
} from '@/src/utils/tokenStorage';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export async function loadStoredToken(): Promise<string | null> {
  authToken = await getStoredToken();
  return authToken;
}

export async function setAuthToken(token: string | null): Promise<void> {
  authToken = token;
  if (token) {
    await saveStoredToken(token);
  } else {
    await removeStoredToken();
  }
}

export async function clearAuth(): Promise<void> {
  authToken = null;
  await clearStoredAuth();
}

export function getAuthToken(): string | null {
  return authToken;
}

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!authToken) {
    await loadStoredToken();
  }
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);
