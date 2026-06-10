import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { CartItem, Product } from '@/src/types';

interface CartState {
  restaurantId: number | null;
  restaurantName: string;
  items: CartItem[];
}

interface CartContextValue extends CartState {
  itemCount: number;
  totalPrice: number;
  addItem: (
    restaurantId: number,
    restaurantName: string,
    product: Product,
  ) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

const emptyCart: CartState = {
  restaurantId: null,
  restaurantName: '',
  items: [],
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);

  const addItem = useCallback(
    (restaurantId: number, restaurantName: string, product: Product) => {
      setCart((current) => {
        if (
          current.restaurantId !== null &&
          current.restaurantId !== restaurantId &&
          current.items.length > 0
        ) {
          Alert.alert(
            'Sepet Temizlenecek',
            'Sepetinizde başka bir restorandan ürün var. Sepeti temizleyip bu ürünü eklemek ister misiniz?',
            [
              { text: 'İptal', style: 'cancel' },
              {
                text: 'Temizle ve Ekle',
                onPress: () => {
                  setCart({
                    restaurantId,
                    restaurantName,
                    items: [
                      {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                      },
                    ],
                  });
                },
              },
            ],
          );
          return current;
        }

        const existing = current.items.find((item) => item.productId === product.id);
        if (existing) {
          return {
            restaurantId,
            restaurantName,
            items: current.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        }

        return {
          restaurantId,
          restaurantName,
          items: [
            ...current.items,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          ],
        };
      });
    },
    [],
  );

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) {
        const items = current.items.filter((item) => item.productId !== productId);
        if (items.length === 0) return emptyCart;
        return { ...current, items };
      }
      return {
        ...current,
        items: current.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      };
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart((current) => {
      const items = current.items.filter((item) => item.productId !== productId);
      if (items.length === 0) return emptyCart;
      return { ...current, items };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(emptyCart);
  }, []);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );

  const totalPrice = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart.items],
  );

  const value = useMemo(
    () => ({
      ...cart,
      itemCount,
      totalPrice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [cart, itemCount, totalPrice, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
