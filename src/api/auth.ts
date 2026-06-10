import { apiClient } from '@/src/api/client';
import { AuthResponse, AuthResult, LoginRequest, RegisterRequest, User } from '@/src/types';
import { extractToken } from '@/src/utils/apiError';

function parseAuthResponse(data: AuthResponse): AuthResult {
  const token = extractToken(data);
  if (!token) {
    throw new Error('Giriş başarılı ancak token alınamadı.');
  }
  if (!data.user) {
    throw new Error('Kullanıcı bilgisi alınamadı.');
  }
  return { token, user: data.user };
}

export async function register(data: RegisterRequest): Promise<AuthResult> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return parseAuthResponse(response.data);
}

export async function login(data: LoginRequest): Promise<AuthResult> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
  return parseAuthResponse(response.data);
}
