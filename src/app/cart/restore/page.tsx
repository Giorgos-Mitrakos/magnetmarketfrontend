// (2026-11-25) Σύνδεσμος «Ολοκλήρωσε την παραγγελία» από το email υπενθύμισης καλαθιού
import type { Metadata } from 'next'
import { Suspense } from 'react'
import CartRestoreClient from './cartRestoreClient'

export const metadata: Metadata = {
    title: 'Επαναφορά καλαθιού',
    robots: { index: false, follow: false },
}

export default function CartRestorePage() {
    return (
        <Suspense fallback={<RestoreMessage text="Φόρτωση του καλαθιού σας…" />}>
            <CartRestoreClient />
        </Suspense>
    )
}

function RestoreMessage({ text }: { text: string }) {
    return <div className="mx-auto max-w-xl px-4 py-24 text-center text-gray-700 dark:text-slate-300">{text}</div>
}
