import { useAuth } from '../hooks/useAuth.js'
import { CartProvider } from '../contexts/CartProvider.jsx'
import App from '../App.jsx'

export default function AppWithCart() {
  const { user } = useAuth()
  const cartKey = user?.id != null ? String(user.id) : '_guest'
  return (
    <CartProvider key={cartKey} userId={user?.id != null ? String(user.id) : null}>
      <App />
    </CartProvider>
  )
}