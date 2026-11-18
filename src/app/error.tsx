'use client'
// app/error.tsx — απρόβλεπτο σφάλμα σε μια σελίδα (2026-10-26)
// Κρατά την κεφαλίδα/υποσέλιδο του site· ο πελάτης μπορεί να ξαναδοκιμάσει.
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Κάτι πήγε στραβά</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Η σελίδα δεν φορτώθηκε σωστά. Δοκιμάστε ξανά σε λίγα δευτερόλεπτα — το καλάθι σας δεν χάνεται.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors"
          >
            Δοκιμάστε ξανά
          </button>
          <Link href="/" className="px-5 py-2.5 rounded-lg border-2 border-siteColors-purple text-siteColors-purple font-semibold">
            Αρχική σελίδα
          </Link>
        </div>
        {error?.digest && <p className="mt-6 text-xs text-gray-400">Κωδικός σφάλματος: {error.digest}</p>}
      </div>
    </div>
  )
}
