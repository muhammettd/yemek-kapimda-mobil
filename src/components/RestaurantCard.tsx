import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/config';
import { Restaurant } from '@/src/types';
import { formatMoney } from '@/src/utils/format';

interface Props {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: Props) {
  const open = restaurant.open ?? restaurant.isOpen;
  const rating = restaurant.ratingStars ?? restaurant.rating;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed, open === false && styles.closed]}
      onPress={onPress}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🍽️</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          {rating != null ? (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {Number(rating).toFixed(1)}</Text>
            </View>
          ) : null}
          {open != null ? (
            <View style={[styles.statusBadge, open ? styles.openBadge : styles.closedBadge]}>
              <Text style={[styles.statusText, open ? styles.openText : styles.closedText]}>
                {open ? 'Açık' : 'Kapalı'}
              </Text>
            </View>
          ) : null}
        </View>
        {restaurant.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {restaurant.estimatedDeliveryTime ? (
            <Text style={styles.meta}>🕐 {restaurant.estimatedDeliveryTime}</Text>
          ) : restaurant.deliveryTime ? (
            <Text style={styles.meta}>🕐 {restaurant.deliveryTime}</Text>
          ) : null}
          {restaurant.minOrderAmount != null ? (
            <Text style={styles.meta}>Min. sipariş {formatMoney(restaurant.minOrderAmount)}</Text>
          ) : null}
        </View>
        <Text style={styles.link}>Menüyü gör →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closed: {
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.85,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flexShrink: 1,
  },
  ratingBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  openBadge: {
    backgroundColor: '#D1FAE5',
  },
  closedBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  openText: {
    color: '#065F46',
  },
  closedText: {
    color: '#374151',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
