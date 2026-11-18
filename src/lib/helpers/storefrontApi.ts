// lib/helpers/storefrontApi.ts
//
// Κλήσεις ΑΠΟ ΤΟΝ SERVER του Next.js προς το Strapi (API routes, server
// components). ΠΟΤΕ από client component: στέλνει το STOREFRONT_SECRET.
//
// - x-storefront-secret: ανοίγει τα προστατευμένα endpoints (πληρωμές
//   τράπεζας, σύνοψη παραγγελίας, ειδοποίηση ομάδας) και κάνει το Strapi να
//   εμπιστεύεται το X-Forwarded-For.
// - x-forwarded-for: η πραγματική IP του πελάτη, για τα όρια αιτημάτων ανά IP
//   στο Strapi (αλλιώς όλοι οι πελάτες θα φαίνονταν με την IP του Next.js).
//
// .env.local:  STOREFRONT_SECRET=<ίδια τιμή με το .env του Strapi>
import { headers } from 'next/headers'

export class StorefrontApiError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

/** Η IP του πελάτη από το αίτημα που δέχτηκε ο Next.js */
export async function requestClientIp(): Promise<string | undefined> {
    try {
        const h = await headers()
        // Πρώτα το X-Real-IP (το ορίζει ο nginx με $remote_addr — δεν
        // πλαστογραφείται από τον browser), μετά το X-Forwarded-For
        const real = h.get('x-real-ip')?.trim()
        const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
        return real || forwarded || undefined
    } catch {
        return undefined
    }
}

interface StorefrontFetchOptions {
    method?: 'GET' | 'POST'
    body?: unknown
    /** JWT του συνδεδεμένου πελάτη (users-permissions), αν υπάρχει */
    jwt?: string | null
}

/**
 * fetch προς το Strapi με το μυστικό και την IP του πελάτη. Σε σφάλμα ρίχνει
 * StorefrontApiError με το (ελληνικό) μήνυμα του Strapi.
 */
export async function storefrontFetch<T = any>(path: string, opts: StorefrontFetchOptions = {}): Promise<T> {
    const secret = process.env.STOREFRONT_SECRET
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (secret) h['x-storefront-secret'] = secret
    else console.warn('[storefront] Λείπει το STOREFRONT_SECRET από το .env.local (χρειάζεται restart του Next.js μετά την προσθήκη)')
    const ip = await requestClientIp()
    if (ip) h['x-forwarded-for'] = ip
    if (opts.jwt) h['Authorization'] = `Bearer ${opts.jwt}`

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${path}`, {
        method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
        headers: h,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        cache: 'no-store',
    })

    const text = await response.text()
    let json: any = null
    try {
        json = text ? JSON.parse(text) : null
    } catch {
        json = null
    }

    if (!response.ok) {
        const message = json?.error?.message || json?.message || `Σφάλμα διακομιστή (${response.status})`
        throw new StorefrontApiError(message, response.status)
    }
    return json as T
}

/** Μήνυμα σφάλματος για τον πελάτη (χωρίς τεχνικές λεπτομέρειες σε 5xx) */
export function publicErrorMessage(error: unknown, fallback = 'Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.'): string {
    if (error instanceof StorefrontApiError && error.status < 500) return error.message
    return fallback
}
