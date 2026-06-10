import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as addressesApi from '@/src/api/addresses';
import * as ordersApi from '@/src/api/orders';
import CartItemRow from '@/src/components/CartItem';
import LoadingView from '@/src/components/LoadingView';
import { COLORS } from '@/src/constants/config';
import { useCart } from '@/src/context/CartContext';
import { Address } from '@/src/types';
import { getApiErrorMessage } from '@/src/utils/apiError';

export default function CartScreen() {
  const {
    items,
    restaurantId,
    restaurantName,
    totalPrice,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressesApi.getAddresses();
      setAddresses(data);
      if (data.length === 1) {
        setSelectedAddressId(data[0].id);
      }
    } catch (err) {
      Alert.alert('Hata', getApiErrorMessage(err, 'Adresler yüklenemedi'));
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (itemCount > 0) {
      void loadAddresses();
    }
  }, [itemCount, loadAddresses]);

  const onPlaceOrder = async () => {
    if (!restaurantId || items.length === 0) {
      Alert.alert('Sepet Boş', 'Sipariş vermek için sepete ürün ekleyin.');
      return;
    }

    if (!selectedAddressId) {
      Alert.alert(
        'Adres Gerekli',
        'Teslimat adresi seçmelisiniz.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Adres Ekle', onPress: () => router.push('/(tabs)/profile') },
        ],
      );
      return;
    }

    setSubmitting(true);
    try {
      await ordersApi.createOrder({
        restaurantId,
        deliveryAddressId: selectedAddressId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      Alert.alert('Başarılı', 'Siparişiniz alındı!', [
        {
          text: 'Tamam',
          onPress: () => {
            clearCart();
            router.push('/(tabs)');
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Sipariş Hatası', getApiErrorMessage(err, 'Sipariş oluşturulamadı'));
    } finally {
      setSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Sepetiniz boş</Text>
        <Text style={styles.emptyText}>Restoranlardan ürün ekleyerek sipariş verebilirsiniz.</Text>
        <Pressable style={styles.browseButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.browseButtonText}>Restoranlara Git</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.restaurantName}>{restaurantName}</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.productId)}
        style={styles.list}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
            onRemove={() => removeItem(item.productId)}
          />
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
        {loadingAddresses ? (
          <LoadingView message="Adresler yükleniyor..." />
        ) : addresses.length === 0 ? (
          <View>
            <Text style={styles.noAddress}>Kayıtlı adres bulunamadı.</Text>
            <Pressable
              style={styles.addAddressButton}
              onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.addAddressText}>Adres Ekle</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {addresses.map((address) => (
              <Pressable
                key={address.id}
                style={[
                  styles.addressChip,
                  selectedAddressId === address.id && styles.addressChipActive,
                ]}
                onPress={() => setSelectedAddressId(address.id)}>
                <Text
                  style={[
                    styles.addressChipTitle,
                    selectedAddressId === address.id && styles.addressChipTitleActive,
                  ]}>
                  {address.title}
                </Text>
                <Text
                  style={[
                    styles.addressChipSub,
                    selectedAddressId === address.id && styles.addressChipSubActive,
                  ]}
                  numberOfLines={1}>
                  {address.district}, {address.city}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} ₺</Text>
        </View>

        <Pressable
          style={[styles.orderButton, submitting && styles.orderButtonDisabled]}
          onPress={() => void onPlaceOrder()}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderButtonText}>Sipariş Ver</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  noAddress: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  addAddressButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  addAddressText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  addressChip: {
    width: 140,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    marginBottom: 12,
  },
  addressChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addressChipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  addressChipTitleActive: {
    color: '#fff',
  },
  addressChipSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  addressChipSubActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  orderButtonDisabled: {
    opacity: 0.7,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
