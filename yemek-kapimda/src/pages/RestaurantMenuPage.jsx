
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { formatMoney } from '../lib/money'
import { useCart } from '../hooks/useCart'

export default function RestaurantMenuPage() {
    const { restaurantId } = useParams()
    const navigate = useNavigate()
    const { addItem } = useCart()
    const id = Number(restaurantId)

    const [restaurant, setRestaurant] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!Number.isFinite(id)) {
            setError('Geçersiz restoran.')
            setLoading(false)
            return
        }
        let cancelled = false
            ; (async () => {
                setLoading(true)
                setError('')
                try {
                    const list = await apiJson('/api/restaurants')
                    if (cancelled) return
                    const r = Array.isArray(list) ? list.find((x) => Number(x.id) === id) : null
                    if (!r) {
                        setError('Restoran bulunamadı.')
                        setRestaurant(null)
                        setProducts([])
                        return
                    }
                    setRestaurant(r)
                    const menu = await apiJson(`/api/restaurants/${id}/products`)
                    if (cancelled) return
                    setProducts(Array.isArray(menu) ? menu : [])
                } catch (e) {
                    if (!cancelled) setError(e.message || 'Menü yüklenemedi.')
                } finally {
                    if (!cancelled) setLoading(false)
                }
            })()
        return () => {
            cancelled = true
        }
    }, [id])

    function handleAddToCart(p) {
        const available = p.available !== false
        if (!available || !restaurant) return
        addItem(
            {
                productId: Number(p.id),
                name: p.name,
                unitPrice: Number(p.price),
            },
            { id: Number(restaurant.id), name: restaurant.name },
        )
    }

    const open = restaurant ? (restaurant.open ?? restaurant.isOpen) : false

    return (
        <div>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
                ← Restoranlara dön
            </button>

            {loading ? (
                <p className="mt-6 text-stone-500">Yükleniyor…</p>
            ) : error ? (
                <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {error}
                </p>
            ) : (
                <>
                    <div className="mt-4">
                        <h1 className="text-2xl font-bold text-stone-900">{restaurant?.name}</h1>
                        {restaurant?.description ? (
                            <p className="mt-1 text-stone-600">{restaurant.description}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-500">
                            {restaurant?.estimatedDeliveryTime ? <span>{restaurant.estimatedDeliveryTime}</span> : null}
                            {restaurant?.minOrderAmount != null ? (
                                <span>Min. sipariş {formatMoney(restaurant.minOrderAmount)}</span>
                            ) : null}
                            <span
                                className={
                                    open
                                        ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900'
                                        : 'rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700'
                                }
                            >
                                {open ? 'Açık' : 'Kapalı'}
                            </span>
                        </div>
                    </div>

                    {/* Alert Box */}
                    {!open && (
                        <div className="mt-8 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-orange-500 text-xl">ℹ️</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                        Şu anda sipariş veremezsiniz
                                    </h3>
                                    <p className="mt-1 text-sm text-orange-700">
                                        Bu restoran şu an kapalı olduğu için sepetinize ürün eklenememektedir. Menüyü inceleyebilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu List (Show even when closed) */}
                    {products.length === 0 ? (
                        <p className="mt-8 text-stone-500">Bu restoranda listelenebilir ürün yok.</p>
                    ) : (
                        <ul className="mt-8 space-y-3">
                            {products.map((p) => {
                                const available = p.available !== false;
                                return (
                                    <li
                                        key={p.id}
                                        className={`flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between transition ${!open ? 'opacity-80' : ''}`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold text-stone-900">{p.name}</h2>
                                            {p.description ? (
                                                <p className="mt-1 text-sm text-stone-500">{p.description}</p>
                                            ) : null}
                                            <p className="mt-2 text-base font-medium text-orange-600">
                                                {formatMoney(p.price)}
                                            </p>
                                        </div>

                                        {/* Hiding/Disabling Buttons */}
                                        <button
                                            type="button"
                                            disabled={!available || !open}
                                            onClick={() => handleAddToCart(p)}
                                            className="shrink-0 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-400 transition"
                                        >
                                            {!open ? 'Kapalı' : available ? 'Sepete ekle' : 'Tükendi'}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            )}

            <p className="mt-8 text-center text-sm text-stone-400 lg:hidden">
                <Link to="/anasayfa" className="text-orange-600 hover:underline">
                    Ana listeye git
                </Link>
            </p>
        </div>
    )
}
