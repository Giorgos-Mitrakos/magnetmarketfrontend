// (2026-10-26) Παλιά σελίδα σφάλματος — σταθερό κείμενο (το ?message= του URL αγνοείται).
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Εγγραφή στο newsletter | Magnet Market',
    robots: { index: false, follow: true },
}

export default function SubscribeErrorPage() {
    return (
        <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-700 p-8 rounded-xl shadow-md text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Η εγγραφή δεν ολοκληρώθηκε</h1>
                <p className="text-gray-600 dark:text-slate-300 mb-6">Δοκιμάστε ξανά σε λίγο.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/newsletter/subscribe" className="px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors">
                        Δοκιμάστε ξανά
                    </Link>
                    <Link href="/" className="px-5 py-2.5 rounded-lg border-2 border-siteColors-purple text-siteColors-purple font-semibold">
                        Αρχική
                    </Link>
                </div>
            </div>
        </div>
    )
}
