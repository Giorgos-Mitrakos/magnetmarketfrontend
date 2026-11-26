// lib/helpers/cartSnapshot.ts  (2026-11-25)
//
// «Ξέχασες κάτι στο καλάθι»: μόλις ξέρουμε το email του πελάτη (συνδεδεμένος,
// 1ο βήμα του checkout ή απλώς πληκτρολογημένο στο πεδίο email) και το καλάθι
// έχει προϊόντα, στέλνουμε αντίγραφο στο Strapi (μέσω /api/storefront/cart-snapshot).
// Το Strapi στέλνει υπενθύμιση αν δεν γίνει παραγγελία. Τίποτα από αυτά δεν
// επηρεάζει το καλάθι ή το checkout.
//
// Αποστολή: 4" μετά την τελευταία αλλαγή — ή ΑΜΕΣΩΣ όταν ο πελάτης κλείνει /
// κρύβει τη σελίδα (pagehide / visibilitychange), με keepalive ώστε το αίτημα
// να ολοκληρωθεί ακόμα κι αν η σελίδα έχει κλείσει.
'use client'
import { useEffect, useRef, useState } from "react";
import { ICartItem } from "@/lib/interfaces/cart";

const TOKEN_KEY = 'mm_cart_token'
const EMAIL_KEY = 'mm_cart_email'
const EMAIL_EVENT = 'mm-cart-email'
const DEBOUNCE_MS = 4000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function readToken(): string | null {
    try { return window.localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function cartToken(): string | null {
    const existing = readToken()
    if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing
    try {
        const bytes = new Uint8Array(18)
        crypto.getRandomValues(bytes)
        const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
        window.localStorage.setItem(TOKEN_KEY, token)
        return token
    } catch {
        return null
    }
}

/** Νέο καλάθι μετά από παραγγελία / άδειασμα → νέα εγγραφή στο Strapi */
function resetToken() {
    try { window.localStorage.removeItem(TOKEN_KEY) } catch { /* — */ }
}

function readDraftEmail(): string {
    try { return window.localStorage.getItem(EMAIL_KEY) || '' } catch { return '' }
}

/**
 * Email που πληκτρολόγησε ο πελάτης στο checkout, πριν πατήσει «Συνέχεια»
 * (καλείται στο blur του πεδίου). Κρατιέται μόνο αν είναι έγκυρο.
 */
export function rememberCartEmail(value: string) {
    const mail = String(value ?? '').trim().toLowerCase()
    if (!EMAIL_RE.test(mail)) return
    try { window.localStorage.setItem(EMAIL_KEY, mail) } catch { /* — */ }
    window.dispatchEvent(new CustomEvent(EMAIL_EVENT, { detail: mail }))
}

const unitPrice = (i: ICartItem) => (i.is_sale && i.sale_price != null && i.sale_price > 0 ? i.sale_price : i.price) || 0

/**
 * @param cart     το καλάθι του context
 * @param email    email του checkout (αφού πατηθεί «Συνέχεια»)
 * @param hydrated true αφού φορτωθεί το αποθηκευμένο καλάθι (αλλιώς το αρχικό
 *                 άδειο καλάθι θα έμοιαζε με «ο πελάτης το άδειασε»)
 * @param accountEmail email του λογαριασμού — τελευταία επιλογή
 * Προτεραιότητα: email του checkout → πληκτρολογημένο email → email λογαριασμού
 */
export function useCartSnapshot(cart: ICartItem[], email: string | null | undefined, hydrated: boolean, accountEmail?: string | null) {
    const lastSent = useRef<string>('')
    const sentItems = useRef(false)
    // Αποστολή που περιμένει το debounce — στέλνεται αμέσως αν κλείσει η σελίδα
    const pending = useRef<null | (() => void)>(null)
    const [draftEmail, setDraftEmail] = useState('')

    // Email πληκτρολογημένο στο checkout (και από προηγούμενη επίσκεψη)
    useEffect(() => {
        if (!hydrated) return
        setDraftEmail(readDraftEmail())
        const onEmail = (e: Event) => setDraftEmail(String((e as CustomEvent).detail || ''))
        window.addEventListener(EMAIL_EVENT, onEmail)
        return () => window.removeEventListener(EMAIL_EVENT, onEmail)
    }, [hydrated])

    // Κλείσιμο / απόκρυψη σελίδας → ό,τι εκκρεμεί φεύγει τώρα
    useEffect(() => {
        const flush = () => { const send = pending.current; pending.current = null; send?.() }
        const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
        window.addEventListener('pagehide', flush)
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            window.removeEventListener('pagehide', flush)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])

    useEffect(() => {
        if (!hydrated) return
        const mail = String(email || draftEmail || accountEmail || '').trim().toLowerCase()
        if (!EMAIL_RE.test(mail)) return
        // Άδειο καλάθι: στέλνουμε μόνο αν είχαμε στείλει προϊόντα πριν (άδειασμα / παραγγελία)
        if (!cart.length && !sentItems.current) return

        const items = cart
            .filter((i) => i.documentId && !i.preorderToken)
            .map((i) => ({ ...i }))
        const payload = {
            email: mail,
            items,
            cartValue: Math.round(items.reduce((s, i) => s + unitPrice(i) * (i.quantity || 1), 0) * 100) / 100,
        }
        const key = JSON.stringify(payload)
        if (key === lastSent.current) return

        const send = () => {
            const token = cartToken()
            if (!token) return
            lastSent.current = key
            fetch('/api/storefront/cart-snapshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartToken: token, ...payload }),
                keepalive: true,
            }).catch(() => { /* χωρίς συνέπειες για τον πελάτη */ })
            if (items.length) {
                sentItems.current = true
            } else {
                sentItems.current = false
                resetToken()
            }
        }

        pending.current = send
        const timer = setTimeout(() => {
            if (pending.current === send) { pending.current = null; send() }
        }, DEBOUNCE_MS)
        return () => {
            clearTimeout(timer)
            if (pending.current === send) pending.current = null
        }
    }, [cart, email, draftEmail, accountEmail, hydrated])
}
