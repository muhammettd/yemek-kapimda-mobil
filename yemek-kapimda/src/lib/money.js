export function formatMoney(amount) {
    if (amount == null) return '—'
    try {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
    } catch {
        return `${amount} ₺`
    }
}