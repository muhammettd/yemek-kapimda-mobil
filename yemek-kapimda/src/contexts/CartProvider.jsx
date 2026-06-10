import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cart-context'

function emptyState() {
    return { restaurantId: null, restaurantName: '', items: [] }
}

function loadStored(storageKey) {
    if (!storageKey) return emptyState()
    try {
        const raw = localStorage.getItem(storageKey)
        if (!raw) return emptyState()
        const p = JSON.parse(raw)
        if (!p || typeof p !== 'object' || !Array.isArray(p.items)) return emptyState()
        return {
            restaurantId: p.restaurantId ?? null,
            restaurantName: typeof p.restaurantName === 'string' ? p.restaurantName : '',
            items: p.items
                .filter(
                    (x) =>
                        x &&
                        typeof x.productId === 'number' &&
                        typeof x.name === 'string' &&
                        typeof x.unitPrice === 'number' &&
                        typeof x.quantity === 'number' &&
                        x.quantity > 0,
                )
                .map((x) => ({
                    productId: x.productId,
                    name: x.name,
                    unitPrice: x.unitPrice,
                    quantity: x.quantity,
                })),
        }
    } catch {
        return emptyState()
    }
}

function persistState(storageKey, state) {
    if (!storageKey) return
    try {
        if (!state.items.length) {
            localStorage.removeItem(storageKey)
            return
        }
        localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
        /* ignore */
    }
}

/**
 * @param {{ children: import('react').ReactNode, userId: string | null | undefined }} props
 */
export function CartProvider({ children, userId }) {
    const storageKey = userId ? `yk_cart_v1_${userId}` : null

    const [cart, setCart] = useState(() => loadStored(storageKey))

    useEffect(() => {
        persistState(storageKey, cart)
    }, [cart, storageKey])

    const addItem = useCallback((line, restaurant) => {
        setCart((prev) => {
            const rid = restaurant.id
            const isOther =
                prev.restaurantId != null && prev.restaurantId !== rid && prev.items.length > 0
            if (isOther) {
                const ok = window.confirm(
                    'Sepetinizde başka restorandan ürün var. Bu ürünü eklemek için sepet sıfırlanacak. Devam edilsin mi?',
                )
                if (!ok) return prev
                return {
                    restaurantId: rid,
                    restaurantName: restaurant.name,
                    items: [{ ...line, quantity: 1 }],
                }
            }
            const items = [...prev.items]
            const idx = items.findIndex((x) => x.productId === line.productId)
            if (idx >= 0) {
                items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 }
            } else {
                items.push({ ...line, quantity: 1 })
            }
            return {
                restaurantId: rid,
                restaurantName: restaurant.name,
                items,
            }
        })
    }, [])

    const setQuantity = useCallback((productId, quantity) => {
        setCart((prev) => {
            if (quantity < 1) {
                const items = prev.items.filter((x) => x.productId !== productId)
                if (items.length === 0) return emptyState()
                return { ...prev, items }
            }
            const items = prev.items.map((x) =>
                x.productId === productId ? { ...x, quantity } : x,
            )
            return { ...prev, items }
        })
    }, [])

    const removeItem = useCallback((productId) => {
        setCart((prev) => {
            const items = prev.items.filter((x) => x.productId !== productId)
            if (items.length === 0) return emptyState()
            return { ...prev, items }
        })
    }, [])

    const clearCart = useCallback(() => {
        setCart(emptyState())
        if (storageKey) localStorage.removeItem(storageKey)
    }, [storageKey])

    const totalQuantity = useMemo(
        () => cart.items.reduce((s, x) => s + x.quantity, 0),
        [cart.items],
    )

    const totalPrice = useMemo(
        () => cart.items.reduce((s, x) => s + x.unitPrice * x.quantity, 0),
        [cart.items],
    )

    const value = useMemo(
        () => ({
            cart,
            addItem,
            setQuantity,
            removeItem,
            clearCart,
            totalQuantity,
            totalPrice,
            isEmpty: cart.items.length === 0,
        }),
        [cart, addItem, setQuantity, removeItem, clearCart, totalQuantity, totalPrice],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}