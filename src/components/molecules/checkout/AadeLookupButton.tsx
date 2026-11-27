'use client'
// (2026-11-26) «Άντληση από ΑΑΔΕ»: συμπληρώνει επωνυμία, Δ.Ο.Υ., δραστηριότητα και οδό από το
// μητρώο της ΑΑΔΕ (RgWsPublic2). Νομός / πόλη / Τ.Κ. ΔΕΝ συμπληρώνονται (επιλέγονται από τις λίστες
// μας και η ονομασία της ΑΑΔΕ δεν ταιριάζει πάντα) — εμφανίζονται ως υπόδειξη.
import { useState } from 'react'

export interface AadeBusiness {
    afm: string
    name: string | null
    doy: string | null
    isActive: boolean
    businessActivity: string | null
    street: string | null
    city: string | null
    zipCode: string | null
}

type Props = {
    /** Το ΑΦΜ της φόρμας (ήδη ελεγμένο ως έγκυρο από τον καλούντα) */
    afm: string
    disabled?: boolean
    onResult: (b: AadeBusiness) => void
}

export default function AadeLookupButton({ afm, disabled, onResult }: Props) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'ok' | 'warn' | 'error'; text: string } | null>(null)

    const lookup = async () => {
        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/storefront/business-lookup?afm=${encodeURIComponent(afm)}`)
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data?.found) {
                setMessage({ type: 'error', text: data?.message || 'Δεν βρέθηκαν στοιχεία στην ΑΑΔΕ.' })
                return
            }
            onResult(data as AadeBusiness)
            const where = [data.zipCode, data.city].filter(Boolean).join(' ')
            setMessage(
                data.isActive
                    ? {
                        type: 'ok',
                        text: `Τα στοιχεία συμπληρώθηκαν από την ΑΑΔΕ.${where ? ` Επιλέξτε Νομό / Πόλη / Τ.Κ. (ΑΑΔΕ: ${where}).` : ''}`,
                    }
                    : { type: 'warn', text: 'Προσοχή: η ΑΑΔΕ εμφανίζει το Α.Φ.Μ. ως ανενεργό (διακοπή εργασιών).' }
            )
        } catch {
            setMessage({ type: 'error', text: 'Η ΑΑΔΕ δεν απαντά αυτή τη στιγμή. Συμπληρώστε τα στοιχεία χειροκίνητα.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={lookup}
                disabled={disabled || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-siteColors-purple px-4 py-2 text-sm font-semibold text-siteColors-purple hover:bg-siteColors-purple hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-300 dark:text-slate-200"
            >
                {loading ? 'Αναζήτηση…' : 'Άντληση στοιχείων από ΑΑΔΕ'}
            </button>
            {disabled && !loading && (
                <small className="ml-2 text-xs text-slate-500 dark:text-slate-400">Συμπληρώστε πρώτα έγκυρο Α.Φ.Μ.</small>
            )}
            {message && (
                <p
                    role="status"
                    className={`mt-2 text-sm ${message.type === 'ok' ? 'text-green-700 dark:text-green-300' : message.type === 'warn' ? 'text-amber-700 dark:text-amber-300' : 'text-red-600 dark:text-red-400'}`}
                >
                    {message.text}
                </p>
            )}
        </div>
    )
}
