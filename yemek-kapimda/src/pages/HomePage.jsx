
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiJson, userDisplayName } from '../lib/api'
import { formatMoney } from '../lib/money'
import { useAuth } from '../hooks/useAuth'

function formatOrderTime(iso) {
    if (!iso) return '—'
    try {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return String(iso)
        return d.toLocaleString('tr-TR', {
            dateStyle: 'short',
            timeStyle: 'short',
        })
    } catch {
        return String(iso)
    }
}

function statusBadgeClass(status) {
    const s = (status || '').toUpperCase()
    if (s === 'DELIVERED') return 'bg-emerald-100 text-emerald-900'
    if (s === 'CANCELED') return 'bg-red-100 text-red-800'
    if (s === 'PENDING') return 'bg-amber-100 text-amber-900'
    if (s === 'PREPARING' || s === 'ON_THE_WAY') return 'bg-sky-100 text-sky-900'
    return 'bg-stone-200 text-stone-800'
}

/** On the homepage, use the word PENDING to highlight confirmation of your new order. */
function orderStatusDisplay(o) {
    const s = (o?.status || '').toUpperCase()
    if (s === 'PENDING') return 'Sipariş onaylandı'
    return o?.statusLabel || o?.status || '—'
}

export default function HomePage() {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const [restaurants, setRestaurants] = useState([])
    const [cuisines, setCuisines] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('ALL');
    const [sortBy, setSortBy] = useState('ratingDesc');
    const [isLoading, setIsLoading] = useState(false);

    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [ordersError, setOrdersError] = useState('')

    const [showOrderPlacedBanner, setShowOrderPlacedBanner] = useState(false)

    useEffect(() => {
        if (location.state?.orderPlaced) {
            setShowOrderPlacedBanner(true)
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, location.pathname, navigate])

    useEffect(() => {
        let cancelled = false
            ; (async () => {
                setLoading(true)
                setError('')
                try {
                    const data = await apiJson('/api/restaurants')
                    if (!cancelled) setRestaurants(Array.isArray(data) ? data : [])
                } catch (e) {
                    if (!cancelled) setError(e.message || 'Restoranlar yüklenemedi.')
                } finally {
                    if (!cancelled) setLoading(false)
                }
            })()
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        let cancelled = false
            ; (async () => {
                setOrdersLoading(true)
                setOrdersError('')
                try {
                    const data = await apiJson('/api/orders')
                    if (!cancelled) setOrders(Array.isArray(data) ? data : [])
                } catch (e) {
                    if (!cancelled) setOrdersError(e.message || 'Siparişler yüklenemedi.')
                } finally {
                    if (!cancelled) setOrdersLoading(false)
                }
            })()
        return () => {
            cancelled = true
        }
    }, [location.key])

    const name = userDisplayName(user)

    useEffect(() => {
        async function fetchCuisines() {
            try {
                const data = await apiJson('api/restaurants/cuisines');
                setCuisines(data || []);
            } catch (error) {
                console.error('Mutfak türleri çekilemedi:', error);
            }
        }
        fetchCuisines();
    }, []);

    // Bring up restaurants each time the search term or cuisine type changes.
    useEffect(() => {
        // We add a small delay (debounce) to avoid overloading the backend when the user types quickly.
        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery.trim()) params.append('query', searchQuery);
                if (selectedCuisine !== 'ALL') params.append('cuisine', selectedCuisine);

                const data = await apiJson(`api/restaurants/search?${params.toString()}`);
                setRestaurants(data || []);
            } catch (error) {
                console.error('Restoranlar aranırken hata oluştu:', error);
            } finally {
                setIsLoading(false);
            }
        }, 400); // 400ms waiting

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCuisine]);

    return (
        <div>
            {showOrderPlacedBanner ? (
                <div
                    className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900"
                    role="status"
                >
                    <p className="text-sm font-medium">Siparişiniz onaylandı.</p>
                    <button
                        type="button"
                        onClick={() => setShowOrderPlacedBanner(false)}
                        className="shrink-0 rounded-lg px-2 py-0.5 text-sm text-emerald-800 hover:bg-emerald-100"
                        aria-label="Kapat"
                    >
                        ✕
                    </button>
                </div>
            ) : null}

            <h1 className="text-2xl font-bold text-stone-900">Restoranlar</h1>
            <p className="mt-1 text-stone-600">
                Merhaba, {name}. Bir restorana tıklayarak menüyü görüntüleyip sepete ürün ekleyebilirsiniz.
            </p>

            <section className="mt-10" aria-labelledby="orders-heading">
                <h2 id="orders-heading" className="text-lg font-semibold text-stone-900">
                    Siparişlerim
                </h2>
                {ordersLoading ? (
                    <p className="mt-4 text-sm text-stone-500">Siparişler yükleniyor…</p>
                ) : ordersError ? (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                        {ordersError}
                    </p>
                ) : orders.length === 0 ? (
                    <p className="mt-4 text-sm text-stone-500">Henüz sipariş yok.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {orders.map((o) => (
                            <li
                                key={o.orderId ?? o.id}
                                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-stone-900">{o.restaurantName ?? 'Restoran'}</p>
                                        <p className="text-xs text-stone-500">{formatOrderTime(o.createdAt)}</p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(o.status)}`}
                                    >
                                        {orderStatusDisplay(o)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-stone-600">
                                    Tutar: <span className="font-semibold text-stone-900">{formatMoney(o.totalAmount)}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className="mt-8 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <input
                    type="text"
                    placeholder="Restoran veya menüde yemek ara..."
                    className="flex-1 border border-stone-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="border border-stone-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition min-w-[180px]"
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                >
                    <option value="ALL">Tüm Mutfaklar</option>
                    {cuisines.map((c, index) => (
                        <option key={index} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <select
                    className="border border-stone-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition min-w-[180px]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="ratingDesc">Puan (Yüksekten Düşüğe)</option>
                    <option value="minOrderAsc">Min. Sipariş (En Düşük)</option>
                    <option value="nameAsc">İsim (A-Z)</option>
                </select>
            </div>


            <h2 className="mt-12 text-lg font-semibold text-stone-900">Restoran listesi</h2>

            {loading ? (
                <p className="mt-4 text-stone-500">Yükleniyor…</p>
            ) : error ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {error}
                </p>
            ) : restaurants.length === 0 ? (
                <p className="mt-4 text-stone-500">Liste boş.</p>
            ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[...restaurants]
                        .sort((a, b) => {
                            if (sortBy === 'ratingDesc') return (b.ratingStars || 0) - (a.ratingStars || 0);
                            if (sortBy === 'minOrderAsc') return (a.minOrderAmount || 0) - (b.minOrderAmount || 0);
                            if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
                            return 0;
                        })
                        .map((r) => {
                            const open = r.open ?? r.isOpen;
                            return (
                                <li key={r.id}>
                                    <Link
                                        to={`/anasayfa/restoran/${r.id}`}
                                        className={`block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md ${open ? '' : 'opacity-80'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            {/* Name and Stars */}
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-stone-900">{r.name}</h3>
                                                {r.ratingStars != null && (
                                                    <div className="flex items-center rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-xs font-bold text-amber-600 shadow-sm">
                                                        <span className="mr-1 text-amber-500 text-sm leading-none">★</span>
                                                        {Number(r.ratingStars).toFixed(1)}
                                                    </div>
                                                )}
                                            </div>

                                            <span
                                                className={
                                                    open
                                                        ? 'shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900'
                                                        : 'shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700'
                                                }
                                            >
                                                {open ? 'Açık' : 'Kapalı'}
                                            </span>
                                        </div>
                                        {r.description ? (
                                            <p className="mt-1 text-sm text-stone-500">{r.description}</p>
                                        ) : null}
                                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-600">
                                            {r.estimatedDeliveryTime ? <span>{r.estimatedDeliveryTime}</span> : null}
                                            {r.estimatedDeliveryTime && r.minOrderAmount != null ? (
                                                <span className="text-stone-300">·</span>
                                            ) : null}
                                            {r.minOrderAmount != null ? (
                                                <span>Min. sipariş {formatMoney(r.minOrderAmount)}</span>
                                            ) : null}
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-orange-600">Menüyü gör →</p>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            )}
        </div>
    )
}
