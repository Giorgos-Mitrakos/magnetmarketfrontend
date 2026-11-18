'use client'
// Κουμπί «Στείλτε μου ξανά το email επιβεβαίωσης».
// Καλεί το ενσωματωμένο endpoint της Strapi /api/auth/send-email-confirmation
// (είναι ανοιχτό στον ρόλο Public από προεπιλογή).
import { useState } from 'react'

type State = 'idle' | 'sending' | 'sent' | 'error'

export default function ResendConfirmation({ email, className = '' }: { email: string; className?: string }) {
    const [state, setState] = useState<State>('idle')

    const resend = async () => {
        if (!email || state === 'sending') return
        setState('sending')
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-email-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            setState(res.ok ? 'sent' : 'error')
        } catch {
            setState('error')
        }
    }

    if (state === 'sent') {
        return (
            <p className={`text-sm text-green-700 ${className}`} role="status">
                Το email στάλθηκε ξανά. Ελέγξτε και τον φάκελο ανεπιθύμητης αλληλογραφίας (spam).
            </p>
        )
    }

    return (
        <div className={className}>
            <button
                type="button"
                onClick={resend}
                disabled={state === 'sending'}
                className="text-sm font-medium text-siteColors-blue underline hover:text-siteColors-purple disabled:opacity-60"
            >
                {state === 'sending' ? 'Αποστολή…' : 'Δεν το λάβατε; Στείλτε το ξανά'}
            </button>
            {state === 'error' && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                    Δεν ήταν δυνατή η αποστολή. Δοκιμάστε ξανά σε λίγο ή επικοινωνήστε μαζί μας.
                </p>
            )}
        </div>
    )
}
