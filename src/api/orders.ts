import { apiClient } from '@/src/api/client';
import { Order, OrderCreateRequest } from '@/src/types';
import { unwrapList } from '@/src/utils/apiError';

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get('/api/orders');
  return unwrapList<Order>(response.data);
}

export async function createOrder(data: OrderCreateRequest): Promise<unknown> {
  const response = await apiClient.post('/api/orders', data);
  return response.data;
}
