import { formatMoney } from '../lib/money'
import { useCart } from '../hooks/useCart'

export default function CartSidebar({ onOpenCheckout }) {
    const { cart, isEmpty, totalPrice, setQuantity, removeItem, clearCart } = useCart()

    if (isEmpty) {
        return null
    }

    return (
        <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Sepet</p>
                        <p className="mt-0.5 text-sm font-semibold text-stone-900">{cart.restaurantName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={clearCart}
                        className="shrink-0 text-xs text-stone-500 underline-offset-2 hover:text-red-600 hover:underline"
                    >
                        Temizle
                    </button>
                </div>
                <ul className="mt-3 max-h-[min(50vh,24rem)] space-y-3 overflow-y-auto pr-1">
                    {cart.items.map((line) => (
                        <li key={line.productId} className="flex gap-3 text-sm">
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-stone-900">{line.name}</p>
                                <p className="text-stone-500">{formatMoney(line.unitPrice)} × {line.quantity}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50">
                                    <button
                                        type="button"
                                        aria-label="Azalt"
                                        className="px-2 py-1 text-stone-600 hover:bg-stone-200"
                                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                                    >
                                        −
                                    </button>
                                    <span className="min-w-[1.25rem] text-center text-xs font-medium">{line.quantity}</span>
                                    <button
                                        type="button"
                                        aria-label="Arttır"
                                        className="px-2 py-1 text-stone-600 hover:bg-stone-200"
                                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(line.productId)}
                                    className="text-xs text-red-600 hover:underline"
                                >
                                    Kaldır
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-sm font-medium text-stone-700">Toplam</span>
                    <span className="text-lg font-bold text-orange-600">{formatMoney(totalPrice)}</span>
                </div>
                {typeof onOpenCheckout === 'function' ? (
                    <button
                        type="button"
                        onClick={onOpenCheckout}
                        className="mt-4 w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Siparişi tamamla
                    </button>
                ) : null}
            </div>
        </div>
    )
}