import { useCallback, useMemo, useState } from 'react'
import { apiUrl, clearStoredAuth, getStoredToken, getStoredUser, persistAuth } from '../lib/api'
import { AuthContext } from './auth-context'

async function readAuthError(res) {
    try {
        const j = await res.json()
        if (j && typeof j.message === 'string' && j.message) return j.message
    } catch {
        /* ignore */
    }
    if (res.status === 401) return 'E-posta veya şifre hatalı.'
    return 'Giriş veya kayıt başarısız.'
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = getStoredToken()
        const u = getStoredUser()
        if (!token || !u) {
            clearStoredAuth()
            return null
        }
        return u
    })

    const logout = useCallback(() => {
        clearStoredAuth()
        setUser(null)
    }, [])

    const login = useCallback(async (email, password) => {
        const res = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
            return { ok: false, error: await readAuthError(res) }
        }
        const data = await res.json()
        persistAuth(data.token, data.user)
        setUser(data.user)
        return { ok: true }
    }, [])

    const register = useCallback(async (payload) => {
        const res = await fetch(apiUrl('/api/auth/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (!res.ok) {
            return { ok: false, error: await readAuthError(res) }
        }
        const data = await res.json()
        persistAuth(data.token, data.user)
        setUser(data.user)
        return { ok: true }
    }, [])

    const refreshUser = useCallback(() => {
        const token = getStoredToken()
        const u = getStoredUser()
        if (!token || !u) {
            clearStoredAuth()
            setUser(null)
            return
        }
        setUser(u)
    }, [])

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            login,
            register,
            logout,
            refreshUser,
        }),
        [user, login, register, logout, refreshUser],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}