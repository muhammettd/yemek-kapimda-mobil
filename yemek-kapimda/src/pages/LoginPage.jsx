import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth()
    const location = useLocation()
    const from = location.state?.from || '/anasayfa'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (isAuthenticated) {
        return <Navigate to={from} replace />
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await login(email, password)
            if (!res.ok) setError(res.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md">
            <h1 className="text-2xl font-bold text-stone-900">Giriş yap</h1>
            
            <p className="mt-2 text-sm text-stone-600">
                Hesabın yok mu?{' '}
                <Link to="/kayit" className="font-medium text-orange-600 hover:text-orange-700">
                    Kayıt ol
                </Link>
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                {error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                        {error}
                    </p>
                ) : null}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                        E-posta
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                        Şifre
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
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
                    {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
                </button>
            </form>
        </div>
    )
}