import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { formatMoney } from '../lib/money'
import { useCart } from '../hooks/useCart'

export default function OrderCheckoutModal({ open, onClose }) {
    const navigate = useNavigate()
    const { cart, totalPrice, clearCart, isEmpty } = useCart()

    const [addresses, setAddresses] = useState([])
    const [addressId, setAddressId] = useState('')
    const [minOrder, setMinOrder] = useState(null)
    const [loadError, setLoadError] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [loadingData, setLoadingData] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        if (isEmpty) {
            onClose()
        }
    }, [open, isEmpty, onClose])

    useEffect(() => {
        if (!open || isEmpty) return
        let cancelled = false
            ; (async () => {
                setLoadingData(true)
                setLoadError('')
                setSubmitError('')
                try {
                    const [addrList, rests] = await Promise.all([
                        apiJson('/api/addresses'),
                        apiJson('/api/restaurants'),
                    ])
                    if (cancelled) return
                    const list = Array.isArray(addrList) ? addrList : []
                    setAddresses(list)
                    const rid = cart.restaurantId
                    const r = Array.isArray(rests) ? rests.find((x) => Number(x.id) === Number(rid)) : null
                    setMinOrder(r?.minOrderAmount ?? null)
                    if (list.length > 0) {
                        setAddressId(String(list[0].id))
                    } else {
                        setAddressId('')
                    }
                } catch (e) {
                    if (!cancelled) setLoadError(e.message || 'Veriler yüklenemedi.')
                } finally {
                    if (!cancelled) setLoadingData(false)
                }
            })()
        return () => {
            cancelled = true
        }
    }, [open, isEmpty, cart.restaurantId])

    if (!open) {
        return null
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitError('')
        if (!addressId) {
            setSubmitError('Lütfen teslimat adresi seçin. Adres yoksa Profilim üzerinden ekleyin.')
            return
        }
        if (minOrder != null && totalPrice < minOrder) {
            setSubmitError(`Minimum sipariş tutarı ${formatMoney(minOrder)}. Sepetinizi güncelleyin.`)
            return
        }
        setSubmitting(true)
        try {
            await apiJson('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    restaurantId: cart.restaurantId,
                    deliveryAddressId: Number(addressId),
                    items: cart.items.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                    })),
                }),
            })
            clearCart()
            onClose()
            navigate('/anasayfa', { state: { orderPlaced: true } })
        } catch (err) {
            setSubmitError(err.message || 'Sipariş oluşturulamadı.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            onMouseDown={(ev) => {
                if (ev.target === ev.currentTarget) onClose()
            }}
        >
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between gap-2">
                    <h2 id="checkout-title" className="text-lg font-bold text-stone-900">
                        Siparişi tamamla
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm text-stone-500 hover:bg-stone-100"
                        aria-label="Kapat"
                    >
                        ✕
                    </button>
                </div>
                <p className="mt-1 text-sm text-stone-600">{cart.restaurantName}</p>
                <p className="mt-2 text-sm text-stone-700">
                    Toplam: <span className="font-semibold text-orange-600">{formatMoney(totalPrice)}</span>
                    {minOrder != null ? (
                        <span className="text-stone-500"> · Min. {formatMoney(minOrder)}</span>
                    ) : null}
                </p>

                {loadError ? (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                        {loadError}
                    </p>
                ) : null}

                {loadingData ? (
                    <p className="mt-6 text-sm text-stone-500">Yükleniyor…</p>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="checkout-address" className="block text-sm font-medium text-stone-700">
                                Teslimat adresi
                            </label>
                            {addresses.length === 0 ? (
                                <p className="mt-2 text-sm text-amber-800">
                                    Kayıtlı adres yok. Önce Profilim sayfasından adres ekleyin.
                                </p>
                            ) : (
                                <select
                                    id="checkout-address"
                                    required
                                    value={addressId}
                                    onChange={(e) => setAddressId(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                >
                                    {addresses.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.title} — {a.district}, {a.city}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {submitError ? (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                                {submitError}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || addresses.length === 0}
                                className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? 'Gönderiliyor…' : 'Siparişi onayla'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}