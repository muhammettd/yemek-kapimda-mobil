import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { TOKEN_KEY, USER_KEY } from '@/src/constants/config';
import { User } from '@/src/types';

const isWeb = Platform.OS === 'web';

async function readItem(key: string): Promise<string | null> {
  try {
    if (isWeb) return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredToken(): Promise<string | null> {
  return readItem(TOKEN_KEY);
}

export async function saveStoredToken(token: string): Promise<void> {
  await writeItem(TOKEN_KEY, token);
}

export async function removeStoredToken(): Promise<void> {
  await deleteItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await readItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function saveStoredUser(user: User): Promise<void> {
  await writeItem(USER_KEY, JSON.stringify(user));
}

export async function removeStoredUser(): Promise<void> {
  await deleteItem(USER_KEY);
}

export async function clearStoredAuth(): Promise<void> {
  await Promise.all([removeStoredToken(), removeStoredUser()]);
}
