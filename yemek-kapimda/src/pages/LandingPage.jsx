import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LandingPage() {
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to="/anasayfa" replace />
    }

    return (
        <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-orange-600">
                Hoş geldiniz
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Lezzetler kapınıza kadar
            </h1>
            <p className="mt-4 text-stone-600">
                Restoranları ve menüleri görmek için hesabınıza giriş yapın veya yeni hesap oluşturun.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                    to="/giris"
                    className="inline-flex rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                    Giriş yap
                </Link>
                <Link
                    to="/kayit"
                    className="inline-flex rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                    Kayıt ol
                </Link>
            </div>
        </div>
    )
}