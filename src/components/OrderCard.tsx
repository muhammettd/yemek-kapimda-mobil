import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/config';
import { Order } from '@/src/types';
import {
  formatMoney,
  formatOrderTime,
  orderStatusColor,
  orderStatusLabel,
} from '@/src/utils/format';

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const colors = orderStatusColor(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.restaurantName}>{order.restaurantName ?? 'Restoran'}</Text>
          <Text style={styles.time}>{formatOrderTime(order.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {orderStatusLabel(order.status, order.statusLabel)}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>
        Tutar: <Text style={styles.amountValue}>{formatMoney(order.totalAmount)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  info: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amount: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontWeight: '700',
    color: COLORS.text,
  },
});
