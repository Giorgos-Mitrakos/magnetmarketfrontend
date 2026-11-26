'use client'
// (2026-11-25) Φέρνει τα προϊόντα του καλαθιού από το Strapi (με το token του
// email) και τα προσθέτει στο τρέχον καλάθι — ό,τι υπάρχει ήδη δεν πειράζεται.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCheckout } from '@/context/checkout'
import { ICartItem } from '@/lib/interfaces/cart'

const key = (i: ICartItem) => i.documentId || String(i.id)

export default function CartRestoreClient() {
    const params = useSearchParams()
    const router = useRouter()
    const { checkout, dispatch } = useCheckout()
    const [error, setError] = useState<string | null>(null)
    const started = useRef(false)

    // Η πιο πρόσφατη κατάσταση: όταν έρθει η απάντηση, το αποθηκευμένο καλάθι
    // έχει ήδη φορτωθεί από το localStorage
    const checkoutRef = useRef(checkout)
    checkoutRef.current = checkout

    useEffect(() => {
        if (started.current) return
        started.current = true
        const token = params.get('t') ?? ''
        if (!/^[a-f0-9]{48}$/i.test(token)) {
            setError('Ο σύνδεσμος δεν είναι έγκυρος.')
            return
        }
        ;(async () => {
            try {
                const res = await fetch('/api/storefront/cart-restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                })
                const data = await res.json().catch(() => ({ items: [] }))
                const restored: ICartItem[] = Array.isArray(data?.items) ? data.items : []
                if (!res.ok || !restored.length) {
                    setError(res.status === 429
                        ? 'Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.'
                        : 'Το καλάθι δεν βρέθηκε ή έχει λήξει.')
                    return
                }
                const current = checkoutRef.current
                const have = new Set(current.cart.map(key))
                const merged = [...current.cart, ...restored.filter((i) => i && !have.has(key(i)))]
                dispatch({ type: 'HYDRATE_CART', payload: { ...current, cart: merged } } as any)
                router.replace('/shopping-cart')
            } catch {
                setError('Δεν ήταν δυνατή η επαναφορά του καλαθιού. Δοκιμάστε ξανά.')
            }
        })()
    }, [params, dispatch, router])

    return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            {error ? (
                <>
                    <p className="mb-6 text-gray-800 dark:text-slate-200">{error}</p>
                    <Link href="/" className="inline-block rounded-lg bg-siteColors-purple px-5 py-2.5 text-white hover:opacity-90">
                        Συνέχεια στις αγορές
                    </Link>
                </>
            ) : (
                <p className="text-gray-700 dark:text-slate-300">Φόρτωση του καλαθιού σας…</p>
            )}
        </div>
    )
}
