import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/config';
import { Product } from '@/src/types';

interface Props {
  product: Product;
  onAdd: () => void;
  restaurantClosed?: boolean;
}

export default function ProductCard({ product, onAdd, restaurantClosed = false }: Props) {
  const unavailable = product.available === false;

  if (restaurantClosed || unavailable) {
    return (
      <View style={[styles.card, styles.cardDisabled]}>
        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          {product.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}
          <Text style={styles.price}>{product.price.toFixed(2)} ₺</Text>
        </View>
        <View style={styles.closedButton}>
          <Text style={styles.closedText}>{restaurantClosed ? 'Kapalı' : 'Tükendi'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text style={styles.price}>{product.price.toFixed(2)} ₺</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        onPress={onAdd}>
        <Text style={styles.addText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardDisabled: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  addText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  closedButton: {
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
