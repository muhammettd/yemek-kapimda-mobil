import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as restaurantsApi from '@/src/api/restaurants';
import ErrorView from '@/src/components/ErrorView';
import LoadingView from '@/src/components/LoadingView';
import ProductCard from '@/src/components/ProductCard';
import { COLORS } from '@/src/constants/config';
import { useCart } from '@/src/context/CartContext';
import { Product, Restaurant } from '@/src/types';
import { getApiErrorMessage } from '@/src/utils/apiError';
import { formatMoney, isRestaurantOpen } from '@/src/utils/format';

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = Number(id);
  const { addItem } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = isRestaurantOpen(restaurant);

  const loadMenu = useCallback(async () => {
    if (!restaurantId || Number.isNaN(restaurantId)) {
      setError('Geçersiz restoran');
      return;
    }
    setError(null);
    try {
      const [productList, restaurantList] = await Promise.all([
        restaurantsApi.getRestaurantProducts(restaurantId),
        restaurantsApi.getRestaurants().catch(() => [] as Restaurant[]),
      ]);
      setProducts(productList);
      const found = restaurantList.find((r) => r.id === restaurantId) ?? null;
      setRestaurant(found);
      if (!found) {
        setError('Restoran bulunamadı.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Menü yüklenemedi'));
    }
  }, [restaurantId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadMenu();
      setLoading(false);
    })();
  }, [loadMenu]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMenu();
    setRefreshing(false);
  }, [loadMenu]);

  const onAddToCart = (product: Product) => {
    if (!isOpen || !restaurant) return;
    addItem(restaurantId, restaurant.name, product);
  };

  if (loading) {
    return <LoadingView message="Menü yükleniyor..." />;
  }

  if (error && !restaurant) {
    return <ErrorView message={error} onRetry={() => void loadMenu()} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: restaurant?.name ?? 'Menü',
          headerBackTitle: 'Restoranlar',
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          ListHeaderComponent={
            restaurant ? (
              <View style={styles.headerBlock}>
                {restaurant.description ? (
                  <Text style={styles.description}>{restaurant.description}</Text>
                ) : null}
                <View style={styles.metaRow}>
                  {restaurant.estimatedDeliveryTime ? (
                    <Text style={styles.meta}>{restaurant.estimatedDeliveryTime}</Text>
                  ) : restaurant.deliveryTime ? (
                    <Text style={styles.meta}>{restaurant.deliveryTime}</Text>
                  ) : null}
                  {restaurant.minOrderAmount != null ? (
                    <Text style={styles.meta}>
                      Min. sipariş {formatMoney(restaurant.minOrderAmount)}
                    </Text>
                  ) : null}
                  <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
                    <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
                      {isOpen ? 'Açık' : 'Kapalı'}
                    </Text>
                  </View>
                </View>
                {!isOpen ? (
                  <View style={styles.closedNotice}>
                    <Text style={styles.closedNoticeTitle}>Şu anda sipariş veremezsiniz</Text>
                    <Text style={styles.closedNoticeText}>
                      Bu restoran kapalı olduğu için şu an sipariş veremezsiniz. Menüyü inceleyebilirsiniz.
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              restaurantClosed={!isOpen}
              onAdd={() => onAddToCart(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Bu restoranda ürün bulunamadı</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  headerBlock: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  meta: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  openBadge: {
    backgroundColor: '#D1FAE5',
  },
  closedBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#065F46',
  },
  closedText: {
    color: '#374151',
  },
  closedNotice: {
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 14,
  },
  closedNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 6,
  },
  closedNoticeText: {
    fontSize: 13,
    color: '#C2410C',
    lineHeight: 19,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
