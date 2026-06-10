
import { apiClient } from '@/src/api/client';
import { Product, Restaurant } from '@/src/types';
import { unwrapList } from '@/src/utils/apiError';

export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await apiClient.get('/api/restaurants');
  return unwrapList<Restaurant>(response.data);
}

export async function getCuisines(): Promise<string[]> {
  // axios.get YERİNE apiClient.get KULLANIYORUZ
  const response = await apiClient.get('/api/restaurants/cuisines', {
    timeout: 60000,
    headers: { Accept: 'application/json' },
  });

  const list = unwrapList<string | { name?: string; cuisine?: string }>(response.data);
  return list
    .map((item) => {
      if (typeof item === 'string') return item;
      return item.name ?? item.cuisine ?? '';
    })
    .filter(Boolean);
}

export async function searchRestaurants(params: {
  query?: string;
  cuisine?: string;
}): Promise<Restaurant[]> {
  const searchParams: Record<string, string> = {};
  if (params.query?.trim()) searchParams.query = params.query.trim();
  if (params.cuisine && params.cuisine !== 'ALL') searchParams.cuisine = params.cuisine;

  const response = await apiClient.get('/api/restaurants/search', { params: searchParams });
  const data = response.data;
  if (Array.isArray(data)) return data as Restaurant[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const restaurants = unwrapList<Restaurant>(record.restaurants ?? record.data ?? record);
    if (restaurants.length > 0) return restaurants;
    return unwrapList<Product>(record.products).length > 0 ? [] : unwrapList<Restaurant>(data);
  }
  return [];
}

export async function getRestaurantProducts(restaurantId: number): Promise<Product[]> {
  const response = await apiClient.get(`/api/restaurants/${restaurantId}/products`);
  return unwrapList<Product>(response.data);
}
