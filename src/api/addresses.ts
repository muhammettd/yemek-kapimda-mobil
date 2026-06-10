import { apiClient } from '@/src/api/client';
import { Address, CreateAddressRequest } from '@/src/types';
import { unwrapList } from '@/src/utils/apiError';

export async function getAddresses(): Promise<Address[]> {
  const response = await apiClient.get('/api/addresses');
  return unwrapList<Address>(response.data);
}

export async function createAddress(data: CreateAddressRequest): Promise<Address> {
  const response = await apiClient.post<Address>('/api/addresses', data);
  return response.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await apiClient.delete(`/api/addresses/${id}`);
}
