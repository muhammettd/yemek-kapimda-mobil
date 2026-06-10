import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Bir hata oluştu'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.message === 'string') return record.message;
      if (typeof record.error === 'string') return record.error;
      if (Array.isArray(record.errors) && record.errors.length > 0) {
        const first = record.errors[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object' && 'message' in first) {
          return String((first as { message: unknown }).message);
        }
      }
    }
    if (error.code === 'ECONNABORTED') {
      return 'Sunucu yanıt vermedi. Lütfen tekrar deneyin.';
    }
    if (!error.response) {
      return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['data', 'content', 'items', 'results']) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

export function extractToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const token =
    record.token ?? record.accessToken ?? record.jwt ?? record.access_token;
  return typeof token === 'string' ? token : null;
}
