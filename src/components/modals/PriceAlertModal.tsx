'use client'
// components/modals/PriceAlertModal.tsx
// «Ειδοποίησέ με όταν η τιμή πέσει στα Χ €» — για επισκέπτες (με email) και
// συνδεδεμένους πελάτες (το email παίρνεται από τον λογαριασμό).
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaTimes, FaBell, FaCheckCircle } from 'react-icons/fa'
import { useSession } from 'next-auth/react'

interface PriceAlertModalProps {
    isOpen: boolean
    onClose: () => void
    productDocumentId: string
    productName: string
    /** Τελική τιμή τώρα (με την προσφορά) */
    currentPrice: number
}

const fmt = (n: number) => n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/** Στρογγυλοποίηση προς τα κάτω σε «στρογγυλή» τιμή (π.χ. 53,91 → 53,90) */
const suggest = (price: number, pct: number) => Math.floor(price * (1 - pct / 100) * 10) / 10
/** «49,90» ή «49.90» ή «1.234,50» → αριθμός */
const parseAmount = (value: string) => {
    const s = value.trim()
    return s.includes(',') ? Number(s.replace(/\./g, '').replace(',', '.')) : Number(s)
}

export default function PriceAlertModal({ isOpen, onClose, productDocumentId, productName, currentPrice }: PriceAlertModalProps) {
    const { data: session, status } = useSession()
    const loggedIn = status === 'authenticated'
    const accountEmail = (session?.user as any)?.email as string | undefined

    const suggestions = useMemo(() => [5, 10, 15].map(p => ({ pct: p, value: suggest(currentPrice, p) })).filter(s => s.value > 0), [currentPrice])
    const [target, setTarget] = useState('')
    const [email, setEmail] = useState('')
    const [website, setWebsite] = useState('') // honeypot
    const [newsletter, setNewsletter] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose

    // Κάθε άνοιγμα: προτεινόμενος στόχος −10% και καθαρή φόρμα
    useEffect(() => {
        if (!isOpen) return
        setTarget(suggestions[1] ? fmt(suggestions[1].value) : '')
        setError(null)
        setDone(null)
        setNewsletter(false)
        const t = setTimeout(() => inputRef.current?.focus(), 50)
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current()
        window.addEventListener('keydown', onKey)
        return () => {
            clearTimeout(t)
            window.removeEventListener('keydown', onKey)
        }
    }, [isOpen, suggestions])

    if (!isOpen) return null

    const targetNumber = parseAmount(target)
    const valid = Number.isFinite(targetNumber) && targetNumber > 0 && targetNumber < currentPrice
    const discount = valid ? Math.round((1 - targetNumber / currentPrice) * 100) : null

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!valid) {
            setError(`Η τιμή-στόχος πρέπει να είναι χαμηλότερη από ${fmt(currentPrice)} €`)
            return
        }
        setBusy(true)
        setError(null)
        try {
            const res = await fetch('/api/price-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productDocumentId, targetPrice: targetNumber, email: loggedIn ? undefined : email, website, newsletter }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json?.error || 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.')
            setDone([json?.message || `Θα σας ειδοποιήσουμε όταν η τιμή πέσει στα ${fmt(targetNumber)} €.`, json?.newsletterMessage].filter(Boolean).join(' '))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="price-alert-title"
        >
            <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 id="price-alert-title" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FaBell className="text-siteColors-pink" aria-hidden="true" /> Ειδοποίηση τιμής
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{productName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Κλείσιμο">
                            <FaTimes className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {done ? (
                        <div className="text-center py-6">
                            <FaCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" aria-hidden="true" />
                            <p className="text-slate-700 dark:text-slate-200">{done}</p>
                            {!loggedIn && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                                    Σας στείλαμε email επιβεβαίωσης με σύνδεσμο ακύρωσης.
                                </p>
                            )}
                            <button onClick={onClose} className="mt-6 px-6 py-2 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors">
                                Εντάξει
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Τρέχουσα τιμή: <strong className="text-slate-900 dark:text-white">{fmt(currentPrice)} €</strong>.
                                Θα σας στείλουμε email μόλις η τιμή πέσει στον στόχο σας.
                            </p>

                            <div className="flex flex-wrap gap-2" role="group" aria-label="Προτεινόμενοι στόχοι">
                                {suggestions.map(s => (
                                    <button
                                        key={s.pct}
                                        type="button"
                                        onClick={() => setTarget(fmt(s.value))}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${fmt(s.value) === target
                                            ? 'bg-siteColors-purple text-white border-siteColors-purple'
                                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-siteColors-purple'}`}
                                    >
                                        −{s.pct}% · {fmt(s.value)} €
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label htmlFor="price-alert-target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Ειδοποιήστε με όταν η τιμή πέσει στα
                                </label>
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        id="price-alert-target"
                                        inputMode="decimal"
                                        value={target}
                                        onChange={e => setTarget(e.target.value.replace(/[^\d.,]/g, ''))}
                                        className="w-full pr-10 pl-4 py-3 text-lg font-semibold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-transparent"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                                </div>
                                {discount !== null && <p className="text-xs text-slate-500 mt-1">{discount}% κάτω από την τρέχουσα τιμή</p>}
                            </div>

                            {!loggedIn && (
                                <div>
                                    <label htmlFor="price-alert-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        id="price-alert-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="example@email.com"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-transparent"
                                    />
                                </div>
                            )}
                            {loggedIn && accountEmail && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Θα σταλεί στο {accountEmail} · θα τη βλέπετε και στα Αγαπημένα σας.</p>
                            )}

                            <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newsletter}
                                    onChange={e => setNewsletter(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-siteColors-purple"
                                />
                                <span>Θέλω να λαμβάνω και τις προσφορές του Magnet Market με email (μπορώ να διαγραφώ όποτε θέλω).</span>
                            </label>

                            {/* honeypot */}
                            <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

                            <button
                                type="submit"
                                disabled={busy}
                                className="w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {busy ? 'Αποθήκευση...' : 'Ενεργοποίηση ειδοποίησης'}
                            </button>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                Ένα email, μόνο όταν πέσει η τιμή. Ακύρωση με ένα κλικ, όποτε θέλετε.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
