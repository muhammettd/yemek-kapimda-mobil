import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as ordersApi from '@/src/api/orders';
import * as restaurantsApi from '@/src/api/restaurants';
import CuisineFilter from '@/src/components/CuisineFilter';
import ErrorView from '@/src/components/ErrorView';
import LoadingView from '@/src/components/LoadingView';
import OrderCard from '@/src/components/OrderCard';
import RestaurantCard from '@/src/components/RestaurantCard';
import { COLORS } from '@/src/constants/config';
import { useAuth } from '@/src/context/AuthContext';
import { Order, Restaurant } from '@/src/types';
import { getApiErrorMessage } from '@/src/utils/apiError';
import { SortOption, getRestaurantCuisine, sortRestaurants, userDisplayName } from '@/src/utils/format';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'ratingDesc', label: 'Puan ↓' },
  { value: 'minOrderAsc', label: 'Min. sipariş ↑' },
  { value: 'nameAsc', label: 'İsim A-Z' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('ratingDesc');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadCuisines = useCallback(async () => {
    try {
      const data = await restaurantsApi.getCuisines();
      setCuisines(data);
    } catch {
      setCuisines([]);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersError(null);
    try {
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(getApiErrorMessage(err, 'Siparişler yüklenemedi'));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const searchRestaurants = useCallback(async (query: string, cuisine: string) => {
    setSearchLoading(true);
    setError(null);
    try {
      const data = await restaurantsApi.searchRestaurants({ query, cuisine });
      setRestaurants(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Restoranlar yüklenemedi'));
      setRestaurants([]);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCuisines();
    void loadOrders();
  }, [loadCuisines, loadOrders]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchRestaurants(searchQuery, selectedCuisine);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCuisine, searchRestaurants]);

  const displayedRestaurants = useMemo(() => {
    let list = restaurants;
    if (selectedCuisine !== 'ALL') {
      list = list.filter(
        (r) => getRestaurantCuisine(r).toLowerCase() === selectedCuisine.toLowerCase(),
      );
    }
    return sortRestaurants(list, sortBy);
  }, [restaurants, sortBy, selectedCuisine]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setOrdersLoading(true);
    await Promise.all([
      searchRestaurants(searchQuery, selectedCuisine),
      loadOrders(),
      loadCuisines(),
    ]);
    setRefreshing(false);
  }, [searchQuery, selectedCuisine, searchRestaurants, loadOrders, loadCuisines]);

  if (loading && restaurants.length === 0) {
    return <LoadingView message="Restoranlar yükleniyor..." />;
  }

  if (error && restaurants.length === 0 && !searchLoading) {
    return (
      <ErrorView
        message={error}
        onRetry={() => {
          setLoading(true);
          void searchRestaurants(searchQuery, selectedCuisine);
        }}
      />
    );
  }

  const name = userDisplayName(user);

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedRestaurants}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.greeting}>Restoranlar</Text>
              <Text style={styles.subtitle}>
                Merhaba, {name}. Bir restorana tıklayarak menüyü görüntüleyip sepete ürün
                ekleyebilirsiniz.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Siparişlerim</Text>
              {ordersLoading ? (
                <Text style={styles.mutedText}>Siparişler yükleniyor…</Text>
              ) : ordersError ? (
                <Text style={styles.errorText}>{ordersError}</Text>
              ) : orders.length === 0 ? (
                <Text style={styles.mutedText}>Henüz sipariş yok.</Text>
              ) : (
                orders.map((order) => <OrderCard key={order.orderId ?? order.id} order={order} />)
              )}
            </View>

            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Restoran veya menüde yemek ara..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>

            <CuisineFilter
              selectedCuisine={selectedCuisine === 'ALL' ? null : selectedCuisine}
              onSelectCuisine={(cuisine) => setSelectedCuisine(cuisine || 'ALL')}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortRow}>
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.sortChip, sortBy === option.value && styles.chipActive]}
                  onPress={() => setSortBy(option.value)}>
                  <Text
                    style={[
                      styles.chipText,
                      sortBy === option.value && styles.chipTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {selectedCuisine !== 'ALL' ? (
              <Text style={styles.filterHint}>
                {displayedRestaurants.length} restoran — {selectedCuisine}
              </Text>
            ) : null}
            <Text style={styles.listTitle}>Restoran listesi</Text>
            {searchLoading ? (
              <Text style={styles.mutedText}>Aranıyor…</Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          !searchLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {selectedCuisine !== 'ALL'
                  ? `"${selectedCuisine}" mutfağında restoran bulunamadı`
                  : searchQuery.trim()
                    ? 'Arama sonucu bulunamadı'
                    : 'Restoran bulunamadı'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  chipsScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  chipsContent: {
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  sortRow: {
    marginBottom: 12,
    paddingRight: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  filterHint: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  mutedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 8,
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
