const TOKEN_KEY = 'yk_access_token'
const USER_KEY = 'yk_user'


export function apiBaseUrl() {
    return 'https://yemek-kapimda.onrender.com'
}

export function apiUrl(path) {
    const base = apiBaseUrl()
    const p = path.startsWith('/') ? path : `/${path}`
    return base ? `${base}${p}` : p
}

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function persistAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export function userDisplayName(user) {
    if (!user) return ''
    const fn = user.firstName ?? ''
    const ln = user.lastName ?? ''
    const combined = `${fn} ${ln}`.trim()
    if (combined) return combined
    return user.name ?? user.email ?? ''
}

async function parseErrorMessage(res) {
    try {
        const j = await res.json()
        if (j && typeof j.message === 'string' && j.message) return j.message
    } catch {
        /* ignore */
    }
    if (res.status === 401) return 'Oturum geçersiz veya süresi dolmuş. Tekrar giriş yapın.'
    return `İstek başarısız (${res.status}).`
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function apiFetch(path, options = {}) {
    const base = apiBaseUrl()
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type') && options.body != null) {
        headers.set('Content-Type', 'application/json')
    }
    const token = getStoredToken()
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
    }
    const res = await fetch(url, { ...options, headers })
    return res
}

export async function apiJson(path, options = {}) {
    const res = await apiFetch(path, options)
    if (res.ok) {
        if (res.status === 204) return null
        const text = await res.text()
        if (!text) return null
        return JSON.parse(text)
    }
    throw new Error(await parseErrorMessage(res))
}