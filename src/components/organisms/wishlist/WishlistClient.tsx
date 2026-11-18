'use client'
// components/organisms/wishlist/WishlistClient.tsx
//
// Σελίδα «Αγαπημένα»: οι κάρτες έρχονται από τον λογαριασμό (συνδεδεμένος)
// ή, για τον επισκέπτη, από τα documentIds που κρατά ο browser του.
// Όταν ο πελάτης βγάζει την καρδιά, η κάρτα φεύγει αμέσως από τη σελίδα.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { FaRegHeart, FaBell } from 'react-icons/fa'
import Image from 'next/image'
import { getStrapiMedia } from '@/repositories/medias'
import { useWishlist } from '@/context/wishlist'
import ProductCard, { ProductCardSkeleton } from '@/components/organisms/productCard'
import { IProductCard } from '@/lib/interfaces/product'

type CardWithId = IProductCard & { documentId?: string }

interface MyAlert {
    documentId: string
    type: 'availability' | 'price'
    targetPrice: number | null
    expiresAt: string | null
    productName: string
    product: CardWithId | null
}

const money = (n?: number | null) => (n ?? 0).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const finalPrice = (p: CardWithId | null) => (p ? (p.is_sale && p.sale_price && p.sale_price < p.price ? p.sale_price : p.price) : null)
const dateGr = (d?: string | null) => (d ? new Date(d).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

/** Ενεργές ειδοποιήσεις τιμής/διαθεσιμότητας του συνδεδεμένου πελάτη */
function MyAlerts() {
    const [alerts, setAlerts] = useState<MyAlert[] | null>(null)
    const [busy, setBusy] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/account/alerts', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : { alerts: [] }))
            .then(j => setAlerts(j?.alerts ?? []))
            .catch(() => setAlerts([]))
    }, [])

    const cancel = async (documentId: string) => {
        setBusy(documentId)
        try {
            const res = await fetch('/api/account/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId }),
            })
            const json = await res.json().catch(() => null)
            if (res.ok) setAlerts(json?.alerts ?? [])
        } finally {
            setBusy(null)
        }
    }

    if (!alerts?.length) return null

    return (
        <section className="pt-6 border-t border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-siteColors-purple dark:text-slate-100 mb-1 flex items-center gap-2">
                <FaBell aria-hidden="true" /> Οι ειδοποιήσεις μου
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Θα λάβετε email μόλις συμβεί αυτό που περιμένετε.</p>
            <ul className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                {alerts.map(a => {
                    const now = finalPrice(a.product)
                    const img = a.product?.image ? getStrapiMedia(a.product.image.formats?.thumbnail?.url || a.product.image.url) : null
                    return (
                        <li key={a.documentId} className="flex items-center gap-3 p-3">
                            <div className="relative w-14 h-14 shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden">
                                {img && <Image src={img} alt="" fill sizes="56px" className="object-contain p-1" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                {a.product?.slug ? (
                                    <Link href={`/product/${a.product.slug}`} className="font-semibold text-sm text-slate-800 dark:text-slate-100 hover:text-siteColors-pink line-clamp-1">
                                        {a.product.name}
                                    </Link>
                                ) : (
                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{a.productName}</span>
                                )}
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                    {a.type === 'price'
                                        ? <>Όταν η τιμή πέσει στα <strong>{money(a.targetPrice)} €</strong>{now ? ` · τώρα ${money(now)} €` : ''}</>
                                        : 'Όταν είναι ξανά διαθέσιμο'}
                                </p>
                                {a.expiresAt && <p className="text-xs text-slate-400">Λήγει {dateGr(a.expiresAt)}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={() => cancel(a.documentId)}
                                disabled={busy === a.documentId}
                                className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                            >
                                Ακύρωση
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export default function WishlistClient() {
    const { ids, ready, isAuthenticated, notify, setNotify, prune } = useWishlist()
    const [retry, setRetry] = useState(0)
    const [products, setProducts] = useState<CardWithId[] | null>(null)
    // (2026-10-27) «Η τιμή έπεσε» από τότε που μπήκε στη λίστα (μόνο με λογαριασμό)
    const [drops, setDrops] = useState<Record<string, { from: number, to: number }>>({})
    const [error, setError] = useState<string | null>(null)
    // Ξαναφόρτωση μόνο όταν μπαίνουν νέα ids (π.χ. merge) — η αφαίρεση φιλτράρει τοπικά.
    // Ref (όχι state): ως state, η αλλαγή του ξανάτρεχε το effect, το cleanup ακύρωνε
    // το αίτημα που μόλις ξεκίνησε και η λίστα έμενε για πάντα σε «φόρτωση» (skeletons).
    const loadedFor = useRef<string>('')

    useEffect(() => {
        if (!ready) return
        const known = new Set((products ?? []).map(p => p.documentId))
        const missing = ids.some(id => !known.has(id))
        const key = `${isAuthenticated ? 'u' : 'g'}:${ids.join(',')}`
        if (!missing && products !== null) return
        if (key === loadedFor.current) return
        loadedFor.current = key

        if (!ids.length) {
            setProducts([])
            return
        }
        let cancelled = false
        let done = false
        const requested = ids
        ;(async () => {
            try {
                const res = isAuthenticated
                    ? await fetch('/api/account/wishlist?full=1', { cache: 'no-store' })
                    : await fetch('/api/wishlist/cards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ documentIds: ids }),
                    })
                const json = await res.json().catch(() => null)
                if (!res.ok) throw new Error(json?.message || 'Προέκυψε σφάλμα')
                if (!cancelled) {
                    const list: CardWithId[] = json?.products ?? []
                    setProducts(list)
                    setDrops(json?.priceDrops ?? {})
                    setError(null)
                    // (2026-10-26) Επισκέπτης: προϊόντα που καταργήθηκαν φεύγουν και από τον browser
                    // (αλλιώς ο μετρητής της καρδιάς στην κεφαλίδα μετρά «φαντάσματα»)
                    if (!isAuthenticated) {
                        const got = new Set(list.map(p => p.documentId))
                        prune(requested.filter(id => !got.has(id)))
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Προέκυψε σφάλμα')
                    loadedFor.current = '' // να ξαναδοκιμάσει στην επόμενη αλλαγή
                }
            } finally {
                done = true
            }
        })()
        return () => {
            cancelled = true
            // (2026-10-28) Αν το αίτημα ακυρώθηκε πριν τελειώσει (React 19 / Strict Mode τρέχει
            // το effect δύο φορές, ή άλλαξαν τα ids στο μεταξύ), η επόμενη εκτέλεση πρέπει να
            // ξαναφορτώσει — αλλιώς ο έλεγχος του loadedFor την σταματούσε και έμεναν τα skeletons
            if (!done) loadedFor.current = ''
        }
    }, [ready, ids, isAuthenticated, products, retry, prune])

    // Πρώτα όσα έπεσαν σε τιμή (μεγαλύτερη πτώση πρώτη), μετά με τη σειρά της λίστας
    const visible = (products ?? [])
        .filter(p => p.documentId && ids.includes(p.documentId))
        .map((p, i) => ({ p, i, d: p.documentId && drops[p.documentId] ? 1 - drops[p.documentId].to / drops[p.documentId].from : 0 }))
        .sort((a, b) => b.d - a.d || a.i - b.i)
        .map(x => x.p)
    const dropCount = visible.filter(p => p.documentId && drops[p.documentId]).length

    return (
        <div className="space-y-6">
            {ready && !isAuthenticated && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-siteColors-lightblue/10 border border-siteColors-lightblue/30">
                    <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                        Τα αγαπημένα σας αποθηκεύονται μόνο σε αυτή τη συσκευή.{' '}
                        <strong>Συνδεθείτε</strong> για να μην τα χάσετε, να τα βλέπετε από παντού και να σας ειδοποιούμε όταν πέσει η τιμή ή ξαναέρθουν σε απόθεμα.
                    </p>
                    <button
                        type="button"
                        onClick={() => signIn(undefined, { callbackUrl: '/wishlist' })}
                        className="shrink-0 px-5 py-2 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors"
                    >
                        Σύνδεση
                    </button>
                </div>
            )}

            {ready && isAuthenticated && (
                <label className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 cursor-pointer">
                    <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-siteColors-purple"
                        checked={notify}
                        onChange={e => setNotify(e.target.checked)}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold inline-flex items-center gap-1"><FaBell aria-hidden="true" /> Ειδοποιήσεις με email</span>
                        <br />
                        Στείλτε μου email όταν πέσει η τιμή σε προϊόν από τα αγαπημένα μου ή όταν ξαναέρθει σε απόθεμα (το πολύ ένα email την ημέρα). Για συγκεκριμένη τιμή-στόχο, πατήστε «Ειδοποίηση όταν πέσει η τιμή» στη σελίδα του προϊόντος.
                    </span>
                </label>
            )}

            {error && (
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                    <span>Δεν φορτώθηκαν τα αγαπημένα σας.</span>
                    <button
                        type="button"
                        onClick={() => { setProducts(null); setError(null); setRetry(r => r + 1) }}
                        className="font-semibold underline"
                    >
                        Δοκιμάστε ξανά
                    </button>
                </div>
            )}

            {error && products === null ? null : !ready || products === null ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: Math.min(Math.max(ids.length, 2), 4) }, (_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : visible.length === 0 ? (
                <div className="text-center py-16">
                    <FaRegHeart className="mx-auto text-5xl text-siteColors-pink/50 mb-4" aria-hidden="true" />
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Δεν έχετε ακόμα αγαπημένα</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Πατήστε την καρδιά σε όποιο προϊόν σας αρέσει για να το βρίσκετε εύκολα εδώ.</p>
                    <Link href="/" className="inline-block mt-6 px-6 py-3 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors">
                        Συνέχεια αγορών
                    </Link>
                </div>
            ) : (
                <>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {visible.length} {visible.length === 1 ? 'προϊόν' : 'προϊόντα'}
                        {dropCount > 0 && (
                            <span className="ml-2 font-semibold text-green-700 dark:text-green-300">
                                · {dropCount} {dropCount === 1 ? 'έπεσε' : 'έπεσαν'} σε τιμή
                            </span>
                        )}
                    </p>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {visible.map((product, index) => {
                            const drop = product.documentId ? drops[product.documentId] : undefined
                            return (
                                <div key={product.documentId} className="flex flex-col">
                                    {drop && (
                                        <p className="mb-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                            <strong>Η τιμή έπεσε</strong> από {money(drop.from)} € σε {money(drop.to)} €
                                            <span className="ml-1 font-semibold">(−{Math.round((1 - drop.to / drop.from) * 100)}%)</span>
                                        </p>
                                    )}
                                    <ProductCard product={product} listName="Αγαπημένα" listId="wishlist" position={index} />
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {ready && isAuthenticated && <MyAlerts />}
        </div>
    )
}
