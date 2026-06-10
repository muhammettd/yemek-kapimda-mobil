import { useContext } from 'react'
import { CartContext } from '../contexts/cart-context'

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart yalnızca CartProvider içinde kullanılmalıdır.')
    return ctx
}