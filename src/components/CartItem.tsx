import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/config';
import { CartItem } from '@/src/types';

interface Props {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItemRow({ item, onIncrease, onDecrease, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toFixed(2)} ₺</Text>
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.qtyButton} onPress={onDecrease}>
          <Text style={styles.qtyText}>−</Text>
        </Pressable>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Pressable style={styles.qtyButton} onPress={onIncrease}>
          <Text style={styles.qtyText}>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={onRemove}>
        <Text style={styles.remove}>Sil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF3ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  remove: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
});
