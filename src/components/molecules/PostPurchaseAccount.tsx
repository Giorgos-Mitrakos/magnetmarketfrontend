'use client'
// (2026-10-25) Σελίδα «Ευχαριστούμε»: λογαριασμός με ένα βήμα για όποιον αγόρασε ως επισκέπτης.
// Το email είναι αυτό της παραγγελίας — ο πελάτης βάζει μόνο κωδικό. Μετά την επιβεβαίωση
// του email, το Strapi συνδέει μόνο του τις παραγγελίες επισκέπτη με το ίδιο email
// (storefront/account.ts → linkGuestOrders), άρα και αυτήν.
import { useState } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { FiPackage, FiTruck, FiTrendingDown, FiEye, FiEyeOff } from 'react-icons/fi'

const RULES: { test: (v: string) => boolean; label: string }[] = [
    { test: (v) => v.length >= 8, label: '8+ χαρακτήρες' },
    { test: (v) => /[0-9]/.test(v), label: 'αριθμός' },
    { test: (v) => /[a-z]/.test(v), label: 'μικρό γράμμα' },
    { test: (v) => /[A-Z]/.test(v), label: 'κεφαλαίο γράμμα' },
    { test: (v) => /[^\w]/.test(v), label: 'σύμβολο' },
]

type Status = 'idle' | 'loading' | 'pending' | 'done' | 'exists' | 'error'

export default function PostPurchaseAccount({ email, orderNumber }: { email?: string; orderNumber: string }) {
    const { status: sessionStatus } = useSession()
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    const [status, setStatus] = useState<Status>('idle')
    const [message, setMessage] = useState('')

    if (!email || sessionStatus === 'loading') return null

    // Ήδη συνδεδεμένος: η παραγγελία είναι στον λογαριασμό του
    if (sessionStatus === 'authenticated') {
        return (
            <div className="mb-8 flex flex-col items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-lg sm:flex-row">
                <p className="text-gray-700">
                    <FiPackage className="mr-2 inline h-5 w-5 text-siteColors-purple" aria-hidden />
                    Την πορεία της παραγγελίας #{orderNumber} τη βλέπετε στον λογαριασμό σας.
                </p>
                <Link href="/account" className="shrink-0 rounded-lg bg-siteColors-purple px-5 py-2 font-medium text-white hover:bg-siteColors-purple/90">
                    Οι παραγγελίες μου
                </Link>
            </div>
        )
    }

    const valid = RULES.every((r) => r.test(password))

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!valid || status === 'loading') return
        setStatus('loading')
        setMessage('')
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, email, password }),
            })
            const result = await res.json().catch(() => ({}))
            if (res.ok && !result.jwt) {
                // Χρειάζεται επιβεβαίωση email (κανονική περίπτωση)
                setStatus('pending')
                return
            }
            if (res.ok) {
                const r = await signIn('credentials', { redirect: false, email, password })
                setStatus(r?.ok ? 'done' : 'pending')
                return
            }
            const msg = String(result?.error?.message ?? '').toLowerCase()
            if (msg.includes('already taken') || msg.includes('already exists')) {
                setStatus('exists')
                return
            }
            setStatus('error')
            setMessage('Δεν δημιουργήθηκε ο λογαριασμός. Δοκιμάστε ξανά σε λίγο.')
        } catch {
            setStatus('error')
            setMessage('Παρουσιάστηκε απρόσμενο σφάλμα. Δοκιμάστε ξανά.')
        }
    }

    return (
        <section className="mb-8 overflow-hidden rounded-xl bg-white shadow-lg" aria-labelledby="pp-account-title">
            <div className="grid gap-6 p-6 md:grid-cols-2">
                <div>
                    <h2 id="pp-account-title" className="text-xl font-semibold text-siteColors-purple">
                        Παρακολουθήστε την παραγγελία σας
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Δημιουργήστε λογαριασμό με ένα βήμα — η παραγγελία #{orderNumber} θα είναι ήδη μέσα.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <FiPackage className="mt-0.5 h-4 w-4 shrink-0 text-siteColors-purple" aria-hidden />
                            Κατάσταση παραγγελίας και αριθμός αποστολής σε ένα σημείο
                        </li>
                        <li className="flex items-start gap-2">
                            <FiTruck className="mt-0.5 h-4 w-4 shrink-0 text-siteColors-purple" aria-hidden />
                            Πιο γρήγορη επόμενη αγορά, με αποθηκευμένες διευθύνσεις
                        </li>
                        <li className="flex items-start gap-2">
                            <FiTrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-siteColors-purple" aria-hidden />
                            Αγαπημένα και ειδοποιήσεις όταν πέφτει η τιμή ή έρχεται απόθεμα
                        </li>
                    </ul>
                </div>

                <div>
                    {status === 'pending' ? (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800" role="status">
                            <p className="font-semibold">Σχεδόν έτοιμο!</p>
                            <p className="mt-1">
                                Σας στείλαμε email στο <strong>{email}</strong>. Πατήστε τον σύνδεσμο επιβεβαίωσης και η
                                παραγγελία #{orderNumber} θα εμφανιστεί στον λογαριασμό σας.
                            </p>
                        </div>
                    ) : status === 'done' ? (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800" role="status">
                            <p className="font-semibold">Ο λογαριασμός σας δημιουργήθηκε.</p>
                            <Link href="/account" className="mt-2 inline-block font-medium underline">Οι παραγγελίες μου</Link>
                        </div>
                    ) : status === 'exists' ? (
                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800" role="status">
                            <p>Υπάρχει ήδη λογαριασμός με το <strong>{email}</strong>.</p>
                            <p className="mt-1">Συνδεθείτε και θα βρείτε εκεί την παραγγελία #{orderNumber}.</p>
                            <Link
                                href={`/login?callbackUrl=${encodeURIComponent('/account')}`}
                                className="mt-3 inline-block rounded-lg bg-siteColors-purple px-5 py-2 font-medium text-white hover:bg-siteColors-purple/90"
                            >
                                Σύνδεση
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-3" noValidate>
                            <div>
                                <label htmlFor="pp-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="pp-email"
                                    type="email"
                                    value={email}
                                    readOnly
                                    autoComplete="username"
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                                />
                            </div>
                            <div>
                                <label htmlFor="pp-password" className="mb-1 block text-sm font-medium text-gray-700">Κωδικός</label>
                                <div className="relative">
                                    <input
                                        id="pp-password"
                                        type={show ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-gray-300 p-3 pr-11 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        aria-describedby="pp-password-rules"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((v) => !v)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                        aria-label={show ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                                    >
                                        {show ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
                                    </button>
                                </div>
                                <p id="pp-password-rules" className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                    {RULES.map((r) => (
                                        <span key={r.label} className={r.test(password) ? 'text-green-600' : 'text-gray-500'}>
                                            {r.test(password) ? '✓' : '•'} {r.label}
                                        </span>
                                    ))}
                                </p>
                            </div>
                            {status === 'error' && message && (
                                <p className="text-sm text-red-600" role="alert">{message}</p>
                            )}
                            <button
                                type="submit"
                                disabled={!valid || status === 'loading'}
                                className="w-full rounded-lg bg-gradient-to-r from-siteColors-purple to-siteColors-pink py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}
