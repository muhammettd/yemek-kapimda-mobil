import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { COLORS } from '@/src/constants/config';
import { useCart } from '@/src/context/CartContext';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restoranlar',
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hesabım',
          tabBarIcon: () => <TabIcon emoji="👤" />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Sepet',
          tabBarIcon: () => <TabIcon emoji="🛒" />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
    </Tabs>
  );
}
