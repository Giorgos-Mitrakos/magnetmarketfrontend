'use client'
// Ενέργειες από συνδέσμους email, σε 2 βήματα: πρώτα δείχνουμε τι θα γίνει,
// και η ενέργεια γίνεται ΜΟΝΟ με το κουμπί (τα προγράμματα email και τα
// antivirus «ανοίγουν» αυτόματα τους συνδέσμους — δεν πρέπει να διαγράφουν
// ή να εγγράφουν κανέναν μόνα τους).
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaBell } from 'react-icons/fa'
import { trackNewsletterUnsubscribe } from '@/lib/helpers/advanced-analytics'

import { EmailLinkAction } from '@/lib/helpers/emailLinks'

interface LinkInfo {
    valid?: boolean
    state?: 'ready' | 'already'
    result?: 'done' | 'already' | 'invalid'
    email?: string
    productName?: string
    expiresAt?: string | null
    alertType?: 'availability' | 'price'
    targetPrice?: number | null
    message?: string
}

const money = (n?: number | null) => (n ?? 0).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/** «ειδοποίηση τιμής (≤ 49,00 €)» ή «ειδοποίηση» */
const alertLabel = (i: LinkInfo) => (i.alertType === 'price' ? `ειδοποίηση τιμής (στόχος ${money(i.targetPrice)} €)` : 'ειδοποίηση')

const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

/** Κείμενα ανά ενέργεια */
const TEXT: Record<EmailLinkAction, {
    title: string
    question: (i: LinkInfo) => string
    note?: string
    button: string
    danger: boolean
    done: (i: LinkInfo) => { title: string, text: string }
    already: (i: LinkInfo) => { title: string, text: string }
}> = {
    'unsubscribe': {
        title: 'Διαγραφή από τα προωθητικά emails',
        question: (i) => `Θέλετε να σταματήσει να λαμβάνει κουπόνια και προσφορές η διεύθυνση ${i.email};`,
        note: 'Τα emails για τις παραγγελίες σας (επιβεβαίωση, αποστολή κ.λπ.) θα συνεχίσουν να στέλνονται κανονικά.',
        button: 'Ναι, διαγραφή',
        danger: true,
        done: (i) => ({ title: 'Η διαγραφή ολοκληρώθηκε', text: `Η διεύθυνση ${i.email} δεν θα λαμβάνει πλέον κουπόνια και προσφορές.` }),
        already: (i) => ({ title: 'Έχετε ήδη διαγραφεί', text: `Η διεύθυνση ${i.email} δεν λαμβάνει προωθητικά emails.` }),
    },
    'newsletter-confirm': {
        title: 'Επιβεβαίωση εγγραφής στο newsletter',
        question: (i) => `Επιβεβαιώστε ότι η διεύθυνση ${i.email} θέλει να λαμβάνει τα νέα και τις προσφορές μας.`,
        note: 'Μπορείτε να διαγραφείτε όποτε θέλετε από τον σύνδεσμο στο τέλος κάθε email.',
        button: 'Επιβεβαίωση εγγραφής',
        danger: false,
        done: (i) => ({ title: 'Η εγγραφή ολοκληρώθηκε!', text: `Ευχαριστούμε! Η διεύθυνση ${i.email} θα λαμβάνει τα νέα και τις προσφορές μας. Αν υπάρχει κουπόνι καλωσορίσματος, θα το βρείτε στο email σας σε λίγα λεπτά.` }),
        already: (i) => ({ title: 'Είστε ήδη εγγεγραμμένοι', text: `Η διεύθυνση ${i.email} είναι ήδη στη λίστα μας.` }),
    },
    'alert-cancel': {
        title: 'Ακύρωση ειδοποίησης',
        question: (i) => `Θέλετε να σταματήσει η ${alertLabel(i)} για «${i.productName}» στη διεύθυνση ${i.email};`,
        button: 'Ακύρωση ειδοποίησης',
        danger: true,
        done: (i) => ({ title: 'Η ειδοποίηση ακυρώθηκε', text: `Δεν θα λάβετε ειδοποίηση για «${i.productName}». Αν αλλάξετε γνώμη, μπορείτε να εγγραφείτε ξανά από τη σελίδα του προϊόντος.` }),
        already: (i) => ({ title: 'Η ειδοποίηση δεν είναι ενεργή', text: `Η ειδοποίηση για «${i.productName}» έχει ήδη σταλεί, ακυρωθεί ή λήξει.` }),
    },
    'alert-renew': {
        title: 'Ανανέωση ειδοποίησης',
        question: (i) => `Θέλετε να συνεχίσουμε να σας ειδοποιούμε για «${i.productName}»${i.alertType === 'price' ? ` όταν η τιμή πέσει στα ${money(i.targetPrice)} €` : ''};${i.expiresAt ? ` Λήγει: ${formatDate(i.expiresAt)}.` : ''}`,
        button: 'Ανανέωση ειδοποίησης',
        danger: false,
        done: (i) => ({
            title: 'Η ειδοποίηση ανανεώθηκε',
            text: `${i.alertType === 'price'
                ? `Θα σας ειδοποιήσουμε μόλις η τιμή του «${i.productName}» πέσει στα ${money(i.targetPrice)} € ή χαμηλότερα.`
                : `Θα σας ειδοποιήσουμε μόλις το «${i.productName}» είναι ξανά διαθέσιμο.`}${i.expiresAt ? ` Νέα λήξη: ${formatDate(i.expiresAt)}.` : ''}`,
        }),
        already: (i) => ({ title: 'Η ειδοποίηση δεν μπορεί να ανανεωθεί', text: `Η ειδοποίηση για «${i.productName}» έχει ήδη σταλεί ή ακυρωθεί.` }),
    },
}

const INVALID_TEXT: Record<EmailLinkAction, string> = {
    'unsubscribe': 'Ο σύνδεσμος διαγραφής δεν είναι έγκυρος ή έχει αλλοιωθεί. Αν θέλετε να σταματήσετε να λαμβάνετε προωθητικά emails, επικοινωνήστε μαζί μας.',
    'newsletter-confirm': 'Ο σύνδεσμος επιβεβαίωσης δεν είναι έγκυρος, έχει λήξει ή έχει αντικατασταθεί από νεότερο email. Κάντε ξανά εγγραφή από το κατάστημα για να λάβετε νέο.',
    'alert-cancel': 'Ο σύνδεσμος δεν είναι έγκυρος ή η ειδοποίηση δεν υπάρχει πια.',
    'alert-renew': 'Ο σύνδεσμος δεν είναι έγκυρος ή η ειδοποίηση δεν υπάρχει πια.',
}

async function call(step: 'peek' | 'act', action: EmailLinkAction, token: string): Promise<LinkInfo> {
    const response = await fetch('/api/email-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, action, token }),
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(json?.message || 'Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.')
    return json
}

type View =
    | { kind: 'loading' }
    | { kind: 'ask', info: LinkInfo }
    | { kind: 'result', ok: boolean, title: string, text: string }
    | { kind: 'error', text: string }

export default function EmailLinkClient({ action, token }: { action: EmailLinkAction, token: string }) {
    const t = TEXT[action]
    const [view, setView] = useState<View>({ kind: 'loading' })
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (!token) {
            setView({ kind: 'result', ok: false, title: 'Ο σύνδεσμος δεν είναι έγκυρος', text: INVALID_TEXT[action] })
            return
        }
        call('peek', action, token)
            .then((info) => {
                if (!info.valid) {
                    setView({ kind: 'result', ok: false, title: 'Ο σύνδεσμος δεν είναι έγκυρος', text: INVALID_TEXT[action] })
                } else if (info.state === 'already') {
                    setView({ kind: 'result', ok: true, ...t.already(info) })
                } else {
                    setView({ kind: 'ask', info })
                }
            })
            .catch((err: Error) => setView({ kind: 'error', text: err.message }))
    }, [action, token, t])

    const confirm = async () => {
        setBusy(true)
        try {
            const res = await call('act', action, token)
            if (res.result === 'done') {
                if (action === 'unsubscribe') trackNewsletterUnsubscribe()
                setView({ kind: 'result', ok: true, ...t.done(res) })
            } else if (res.result === 'already') {
                setView({ kind: 'result', ok: true, ...t.already(res) })
            } else {
                setView({ kind: 'result', ok: false, title: 'Ο σύνδεσμος δεν είναι έγκυρος', text: INVALID_TEXT[action] })
            }
        } catch (err) {
            setView({ kind: 'error', text: err instanceof Error ? err.message : 'Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.' })
        } finally {
            setBusy(false)
        }
    }

    const Icon = action.startsWith('alert') ? FaBell : FaEnvelope

    return (
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-slate-700 p-8 rounded-xl shadow-md">
                {view.kind === 'loading' && (
                    <div className="flex flex-col items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-siteColors-purple" />
                        <p className="mt-4 text-slate-600 dark:text-slate-300">Φόρτωση...</p>
                    </div>
                )}

                {view.kind === 'ask' && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <Icon className="text-2xl text-siteColors-purple dark:text-purple-300 shrink-0" aria-hidden />
                            <h1 className="text-2xl font-bold text-siteColors-purple dark:text-purple-300">{t.title}</h1>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 mb-6">{t.question(view.info)}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={confirm}
                                disabled={busy}
                                aria-busy={busy}
                                className={`flex-1 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${t.danger
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-siteColors-purple hover:bg-siteColors-purple/90'}`}
                            >
                                {busy ? 'Περιμένετε...' : t.button}
                            </button>
                            <Link
                                href="/"
                                className="flex-1 text-center bg-slate-200 dark:bg-slate-500 text-slate-700 dark:text-slate-100 py-2.5 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-400 transition-colors"
                            >
                                Όχι, επιστροφή
                            </Link>
                        </div>
                        {t.note && <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">{t.note}</p>}
                    </>
                )}

                {view.kind === 'result' && (
                    <div className="text-center">
                        {view.ok
                            ? <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" aria-hidden />
                            : <FaExclamationTriangle className="text-5xl text-amber-500 mx-auto mb-4" aria-hidden />}
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{view.title}</h1>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">{view.text}</p>
                        <Link href="/" className="inline-block bg-siteColors-purple hover:bg-siteColors-purple/90 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
                            Επιστροφή στο κατάστημα
                        </Link>
                    </div>
                )}

                {view.kind === 'error' && (
                    <div className="text-center">
                        <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" aria-hidden />
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Προέκυψε σφάλμα</h1>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">{view.text}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-block bg-siteColors-purple hover:bg-siteColors-purple/90 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                        >
                            Δοκιμάστε ξανά
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
