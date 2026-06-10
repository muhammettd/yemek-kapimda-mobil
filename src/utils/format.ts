import { Restaurant, User } from '@/src/types';

export function isRestaurantOpen(restaurant: Restaurant | null | undefined): boolean {
  if (!restaurant) return false;
  const open = restaurant.open ?? restaurant.isOpen;
  return open === true;
}

export function getRestaurantCuisine(restaurant: Restaurant): string {
  return restaurant.cuisine ?? restaurant.cuisineType ?? '';
}

export function formatMoney(amount: number | null | undefined): string {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  } catch {
    return `${amount} ₺`;
  }
}

export function userDisplayName(user: User | null | undefined): string {
  if (!user) return '';
  const combined = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (combined) return combined;
  return user.name ?? user.email ?? '';
}

export function formatOrderTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(iso);
  }
}

export function orderStatusLabel(status?: string, statusLabel?: string): string {
  const s = (status ?? '').toUpperCase();
  if (s === 'PENDING') return 'Sipariş onaylandı';
  return statusLabel ?? status ?? '—';
}

export function orderStatusColor(status?: string): { bg: string; text: string } {
  const s = (status ?? '').toUpperCase();
  if (s === 'DELIVERED') return { bg: '#D1FAE5', text: '#065F46' };
  if (s === 'CANCELED') return { bg: '#FEE2E2', text: '#991B1B' };
  if (s === 'PENDING') return { bg: '#FEF3C7', text: '#92400E' };
  if (s === 'PREPARING' || s === 'ON_THE_WAY') return { bg: '#E0F2FE', text: '#075985' };
  return { bg: '#E5E7EB', text: '#374151' };
}

export type SortOption = 'ratingDesc' | 'minOrderAsc' | 'nameAsc';

export function sortRestaurants<T extends {
  name: string;
  ratingStars?: number;
  rating?: number;
  minOrderAmount?: number;
}>(list: T[], sortBy: SortOption): T[] {
  return [...list].sort((a, b) => {
    if (sortBy === 'ratingDesc') {
      return (b.ratingStars ?? b.rating ?? 0) - (a.ratingStars ?? a.rating ?? 0);
    }
    if (sortBy === 'minOrderAsc') {
      return (a.minOrderAmount ?? 0) - (b.minOrderAmount ?? 0);
    }
    return a.name.localeCompare(b.name, 'tr');
  });
}
