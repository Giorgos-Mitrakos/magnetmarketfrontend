'use client'
// context/wishlist.tsx
//
// Αγαπημένα — ίδια λειτουργία για όλους:
//  - Επισκέπτης: η λίστα (documentIds προϊόντων) μένει στον browser (localStorage).
//  - Συνδεδεμένος: η λίστα είναι στον λογαριασμό (Strapi, μέσω /api/account/wishlist).
//  - Όταν ο επισκέπτης συνδεθεί, η λίστα του browser ενώνεται με του
//    λογαριασμού (merge) και ο browser αδειάζει — δεν χάνεται τίποτα.
// Φορτώνει ΜΙΑ φορά ανά επίσκεψη (μόνο ids), όχι ανά κάρτα.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

const STORAGE_KEY = 'mm_wishlist'
export const MAX_WISHLIST_ITEMS = 200

interface WishlistContextValue {
    ids: string[]
    /** true όταν ξέρουμε ήδη τη λίστα (για να μη «τρεμοπαίζουν» οι καρδιές) */
    ready: boolean
    isAuthenticated: boolean
    /** Ειδοποιήσεις με email (μόνο με λογαριασμό) */
    notify: boolean
    has: (documentId?: string | null) => boolean
    /** Προσθήκη/αφαίρεση· επιστρέφει true αν το προϊόν μπήκε στη λίστα */
    toggle: (documentId: string) => Promise<boolean>
    setNotify: (value: boolean) => Promise<void>
    /** (2026-10-26) Επισκέπτης: βγάζει από τη λίστα του browser προϊόντα που δεν υπάρχουν πια */
    prune: (documentIds: string[]) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function readLocal(): string[] {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').slice(0, MAX_WISHLIST_ITEMS) : []
    } catch {
        return []
    }
}

function writeLocal(ids: string[]) {
    try {
        if (ids.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
        else localStorage.removeItem(STORAGE_KEY)
    } catch {
        // π.χ. ιδιωτική περιήγηση χωρίς αποθήκευση — η λίστα ισχύει μόνο για τη σελίδα
    }
}

async function api<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(json?.message || 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.')
    return json as T
}

interface ServerList {
    productDocumentIds: string[]
    notify: boolean
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { status } = useSession()
    const isAuthenticated = status === 'authenticated'
    const [ids, setIds] = useState<string[]>([])
    const [notify, setNotifyState] = useState(true)
    const [ready, setReady] = useState(false)
    const idsRef = useRef<string[]>([])
    idsRef.current = ids

    // Φόρτωση: λογαριασμός (με merge της λίστας του browser) ή browser
    useEffect(() => {
        if (status === 'loading') return
        let cancelled = false

        if (status !== 'authenticated') {
            setIds(readLocal())
            setReady(true)
            return
        }

        ;(async () => {
            try {
                const local = readLocal()
                const data = local.length
                    ? await api<ServerList>('/api/account/wishlist/merge', { productDocumentIds: local })
                    : await api<ServerList>('/api/account/wishlist')
                if (cancelled) return
                if (local.length) writeLocal([]) // ενώθηκε με τον λογαριασμό
                setIds(data.productDocumentIds ?? [])
                setNotifyState(data.notify !== false)
            } catch {
                if (!cancelled) setIds([])
            } finally {
                if (!cancelled) setReady(true)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [status])

    // Επισκέπτης με πολλές καρτέλες: συγχρονισμός όταν αλλάζει σε άλλη καρτέλα
    useEffect(() => {
        if (isAuthenticated) return
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setIds(readLocal())
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [isAuthenticated])

    const has = useCallback((documentId?: string | null) => !!documentId && ids.includes(documentId), [ids])

    const toggle = useCallback(
        async (documentId: string) => {
            const before = idsRef.current
            const adding = !before.includes(documentId)
            if (adding && before.length >= MAX_WISHLIST_ITEMS) {
                toast.warning(`Τα αγαπημένα χωράνε έως ${MAX_WISHLIST_ITEMS} προϊόντα`)
                return false
            }
            const next = adding ? [documentId, ...before] : before.filter(id => id !== documentId)
            setIds(next) // αμέσως στην οθόνη

            if (!isAuthenticated) {
                writeLocal(next)
                return adding
            }
            try {
                const data = await api<ServerList>(`/api/account/wishlist/${adding ? 'add' : 'remove'}`, {
                    productDocumentId: documentId,
                })
                setIds(data.productDocumentIds ?? next)
                return adding
            } catch (error) {
                setIds(before)
                toast.error(error instanceof Error ? error.message : 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.')
                return !adding
            }
        },
        [isAuthenticated]
    )

    const setNotify = useCallback(
        async (value: boolean) => {
            if (!isAuthenticated) return
            const before = notify
            setNotifyState(value)
            try {
                await api<ServerList>('/api/account/wishlist/settings', { notify: value })
            } catch (error) {
                setNotifyState(before)
                toast.error(error instanceof Error ? error.message : 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.')
            }
        },
        [isAuthenticated, notify]
    )

    const prune = useCallback(
        (documentIds: string[]) => {
            if (isAuthenticated || !documentIds.length) return // ο λογαριασμός τα φιλτράρει ήδη στη Strapi
            const drop = new Set(documentIds)
            const next = idsRef.current.filter(id => !drop.has(id))
            if (next.length === idsRef.current.length) return
            setIds(next)
            writeLocal(next)
        },
        [isAuthenticated]
    )

    const value = useMemo(
        () => ({ ids, ready, isAuthenticated, notify, has, toggle, setNotify, prune }),
        [ids, ready, isAuthenticated, notify, has, toggle, setNotify, prune]
    )

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
    const ctx = useContext(WishlistContext)
    if (!ctx) throw new Error('useWishlist: λείπει το WishlistProvider (app/layout.tsx)')
    return ctx
}
