// (2026-10-26) Παλιά σελίδα «επιτυχίας» — σταθερό κείμενο (το ?message= του URL αγνοείται,
// ώστε κανείς να μη μπορεί να εμφανίσει δικό του κείμενο στο site μας).
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Εγγραφή στο newsletter | Magnet Market',
    robots: { index: false, follow: true },
}

export default function SubscribeSuccessPage() {
    return (
        <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-700 p-8 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Σχεδόν έτοιμο!</h1>
                <p className="text-gray-600 dark:text-slate-300 mb-6">
                    Σας στείλαμε email επιβεβαίωσης. Πατήστε τον σύνδεσμο που περιέχει για να ολοκληρωθεί η εγγραφή.
                </p>
                <Link href="/" className="inline-block px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors">
                    Επιστροφή στην αρχική
                </Link>
            </div>
        </div>
    )
}
