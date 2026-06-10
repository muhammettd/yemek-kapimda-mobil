import { Link, NavLink, Outlet } from 'react-router-dom'
import { userDisplayName } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

function navClass({ isActive }) {
    return [
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
            ? 'bg-orange-500 text-white'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
    ].join(' ')
}

export default function Layout() {
    const { user, isAuthenticated, logout } = useAuth()

    return (
        <div className="min-h-dvh bg-stone-50 text-stone-900">
            <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
                    <Link to="/" className="text-lg font-bold tracking-tight text-orange-600">
                        Yemek Kapımda
                    </Link>
                    <nav className="flex flex-wrap items-center gap-1">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/anasayfa" className={navClass}>
                                    Anasayfa
                                </NavLink>
                                <NavLink to="/profil" className={navClass}>
                                    Profilim
                                </NavLink>
                                <span className="hidden text-stone-400 sm:inline">|</span>
                                <span className="max-w-[140px] truncate text-sm text-stone-500 sm:max-w-[200px]">
                                    {userDisplayName(user)}
                                </span>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
                                >
                                    Çıkış
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/giris" className={navClass}>
                                    Giriş yap
                                </NavLink>
                                <NavLink
                                    to="/kayit"
                                    className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                                >
                                    Kayıt ol
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}