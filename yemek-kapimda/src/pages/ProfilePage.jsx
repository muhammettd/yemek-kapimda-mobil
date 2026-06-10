import { useCallback, useEffect, useState } from 'react'
import { apiJson, userDisplayName } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
    const { user } = useAuth()
    const [addresses, setAddresses] = useState([])
    const [listLoading, setListLoading] = useState(true)
    const [listError, setListError] = useState('')

    const [title, setTitle] = useState('Ev')
    const [line, setLine] = useState('')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')
    const [addrMsg, setAddrMsg] = useState({ type: '', text: '' })
    const [saving, setSaving] = useState(false)

    const loadAddresses = useCallback(async () => {
        setListLoading(true)
        setListError('')
        try {
            const data = await apiJson('/api/addresses')
            setAddresses(Array.isArray(data) ? data : [])
        } catch (e) {
            setListError(e.message || 'Adresler yüklenemedi.')
            setAddresses([])
        } finally {
            setListLoading(false)
        }
    }, [])

    useEffect(() => {
        loadAddresses()
    }, [loadAddresses])

    // --- New Address Add ---
    async function handleAddAddress(e) {
        e.preventDefault()
        setAddrMsg({ type: '', text: '' })
        if (!line.trim() || !district.trim() || !city.trim()) {
            setAddrMsg({ type: 'err', text: 'Açık adres, ilçe ve şehir zorunlu.' })
            return
        }
        setSaving(true)
        try {
            await apiJson('/api/addresses', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    fullAddress: line.trim(),
                    district: district.trim(),
                    city: city.trim(),
                }),
            })
            setAddrMsg({ type: 'ok', text: 'Adres eklendi.' })
            setLine('')
            setDistrict('')
            setCity('')
            setTitle('Ev')
            await loadAddresses()
        } catch (err) {
            setAddrMsg({ type: 'err', text: err.message || 'Kayıt başarısız.' })
        } finally {
            setSaving(false)
        }
    }

    // --- Address Delete (Soft Delete) ---
    async function handleDeleteAddress(id) {
        if (!window.confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

        try {
            // Because we're performing a soft delete on the backend,
            // this request doesn't delete the address from the database; it only marks it.
            await apiJson(`/api/addresses/${id}`, { method: 'DELETE' });

            // Remove from interface instantly
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Silme hatası:", error);
            alert(error.message || "Adres silinemedi.");
        }
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Profilim</h1>
                <p className="mt-1 text-stone-600">Hesap bilgileriniz ve kayıtlı adresleriniz.</p>
            </div>

            {/* Account Section */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">Bilgilerim</h2>
                <dl className="mt-6 max-w-md space-y-4">
                    <div>
                        <dt className="text-sm font-medium text-stone-700">Ad soyad</dt>
                        <dd className="mt-1 text-stone-900">{userDisplayName(user)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-stone-700">E-posta</dt>
                        <dd className="mt-1 text-stone-900">{user?.email ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-stone-700">Telefon</dt>
                        <dd className="mt-1 text-stone-900">{user?.phoneNumber ?? '—'}</dd>
                    </div>
                </dl>
            </section>

            {/* Saved Address Section */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">Kayıtlı adreslerim</h2>
                <p className="mt-1 text-sm text-stone-500">Teslimat adresleriniz listelenir.</p>

                {listLoading ? (
                    <p className="mt-6 text-sm text-stone-500">Adresler yükleniyor…</p>
                ) : listError ? (
                    <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                        {listError}
                    </p>
                ) : addresses.length === 0 ? (
                    <p className="mt-6 text-sm text-stone-500">Henüz kayıtlı adres yok.</p>
                ) : (
                    <ul className="mt-6 space-y-3">
                        {addresses.map((a) => (
                            <li
                                key={a.id}
                                className="relative rounded-xl border border-stone-100 bg-stone-50 p-4 transition-all hover:border-stone-200"
                            >
                                <p className="font-medium text-stone-900 pr-10">{a.title}</p>
                                <p className="mt-1 text-sm text-stone-600 pr-10">{a.fullAddress}</p>
                                <p className="mt-1 text-sm text-stone-500">
                                    {[a.district, a.city].filter(Boolean).join(' / ')}
                                </p>

                                {/* Delete Button */}
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => handleDeleteAddress(a.id)}
                                        className="text-stone-400 hover:text-red-600 transition p-1"
                                        title="Adresi Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* New Address Add Form */}
                <form onSubmit={handleAddAddress} className="mt-8 max-w-lg space-y-4 border-t border-stone-100 pt-8">
                    <h3 className="text-sm font-semibold text-stone-800">Yeni adres ekle</h3>
                    {addrMsg.text ? (
                        <p className={addrMsg.type === 'ok' ? 'text-sm text-emerald-600' : 'text-sm text-red-600'}>
                            {addrMsg.text}
                        </p>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Adres adı</label>
                            <select
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
                            >
                                <option value="Ev">Ev 🏠</option>
                                <option value="İş">İş 🏢</option>
                                <option value="Diğer">Diğer 📍</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Açık adres</label>
                            <textarea
                                rows={2}
                                required
                                value={line}
                                onChange={(e) => setLine(e.target.value)}
                                placeholder="Sokak, bina, daire..."
                                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">İlçe</label>
                            <input
                                type="text"
                                required
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Şehir</label>
                            <input
                                type="text"
                                required
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60 transition shadow-sm"
                    >
                        {saving ? 'Kaydediliyor…' : 'Adresi kaydet'}
                    </button>
                </form>
            </section>
        </div>
    )
}