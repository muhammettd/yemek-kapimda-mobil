import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import CartSidebar from './CartSidebar'
import OrderCheckoutModal from './OrderCheckoutModal'

export default function HomeLayout() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const openCheckout = useCallback(() => setCheckoutOpen(true), [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
        <aside className="w-full shrink-0 lg:w-80">
          <CartSidebar onOpenCheckout={openCheckout} />
        </aside>
      </div>
      <OrderCheckoutModal open={checkoutOpen} onClose={closeCheckout} />
    </>
  )
}