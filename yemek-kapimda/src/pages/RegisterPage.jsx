import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
    const { register, isAuthenticated } = useAuth()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (isAuthenticated) {
        return <Navigate to="/anasayfa" replace />
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı (backend kuralı).')
            return
        }
        setLoading(true)
        try {
            const body = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
                ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
            }
            const res = await register(body)
            if (!res.ok) setError(res.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md">
            <h1 className="text-2xl font-bold text-stone-900">Kayıt ol</h1>
            <p className="mt-1 text-sm text-stone-600">
                Zaten hesabın var mı?{' '}
                <Link to="/giris" className="font-medium text-orange-600 hover:text-orange-700">
                    Giriş yap
                </Link>
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                {error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                        {error}
                    </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-stone-700">
                            Ad
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-stone-700">
                            Soyad
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            autoComplete="family-name"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-stone-700">
                        E-posta
                    </label>
                    <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                        Telefon <span className="font-normal text-stone-500">(isteğe bağlı)</span>
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    />
                </div>
                <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-stone-700">
                        Şifre
                    </label>
                    <input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                    {loading ? 'Kaydediliyor…' : 'Hesap oluştur'}
                </button>
            </form>
        </div>
    )
}