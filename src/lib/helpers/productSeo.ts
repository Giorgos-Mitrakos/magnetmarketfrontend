// lib/helpers/productSeo.ts
// (2026-10-26) Αυτόματο SEO προϊόντος (πρότυπο, χωρίς κόστος) όταν δεν υπάρχει
// χειροκίνητο από τον Product Manager:
//   τίτλος:    {μάρκα} {όνομα} – {κατηγορία}            (η κατηγορία μόνο αν χωράει)
//   περιγραφή: {όνομα}: {3 χαρακτηριστικά}. {διαθεσιμότητα}. Τιμή {τιμή} € (από {παλιά} €).
// Υπολογίζεται κάθε φορά που ανοίγει η σελίδα — τιμή / διαθεσιμότητα πάντα τρέχουσες.
import { plainText } from './sanitizeHtml'

interface SeoInput {
    name: string
    brand?: { name: string } | null
    category?: { name: string } | null
    status?: string | null
    inventory?: number | null
    is_in_house?: boolean | null
    price?: number | null
    sale_price?: number | null
    is_sale?: boolean | null
    prod_chars?: { name: string; value: string }[] | null
    short_description?: string | null
}

const TITLE_MAX = 58 // + « | Magnet Market» από το layout / τη σελίδα
const DESC_MAX = 160

const clean = (s: string | null | undefined) => String(s ?? '').replace(/\s+/g, ' ').trim()
const euro = (v: number) => `${v.toFixed(2).replace('.', ',')} €`

/** Κόψιμο σε κενό (όχι στη μέση λέξης) */
function cut(text: string, max: number): string {
    if (text.length <= max) return text
    const part = text.slice(0, max - 1)
    const space = part.lastIndexOf(' ')
    return `${(space > max * 0.6 ? part.slice(0, space) : part).replace(/[\s,.;:–-]+$/, '')}…`
}

/** Χαρακτηριστικά που δεν λένε τίποτα σε αποτέλεσμα αναζήτησης */
const SKIP_CHAR = /^(εγγύηση|βάρος|διαστάσεις|κωδικός|ean|barcode|part ?number|mpn|sku|χώρα|περιεχόμενα|χρώμα συσκευασίας)/i

function charPhrases(chars: SeoInput['prod_chars'], name: string, limit = 3): string[] {
    const out: string[] = []
    const inName = name.toLowerCase()
    for (const c of chars ?? []) {
        const name = clean(c?.name)
        const value = clean(c?.value)
        if (!name || !value || SKIP_CHAR.test(name) || value.length > 40) continue
        if (/^(όχι|no|-|0)$/i.test(value)) continue
        // «Ναι» → το όνομα του χαρακτηριστικού (π.χ. «Wi-Fi»)
        const phrase = /^(ναι|yes)$/i.test(value) ? name : /^[\d.,\s]+$/.test(value) ? `${name} ${value}` : value
        // Ήδη στο όνομα (π.χ. «1080p») → δεν το ξαναλέμε
        if (inName.includes(phrase.toLowerCase())) continue
        if (!out.some((p) => p.toLowerCase() === phrase.toLowerCase())) out.push(phrase)
        if (out.length >= limit) break
    }
    return out
}

function availabilityText(p: SeoInput): string | null {
    switch (p.status) {
        case 'InStock':
        case 'MediumStock':
        case 'LowStock':
            return Number(p.inventory) > 0 && p.is_in_house ? 'Άμεσα διαθέσιμο' : 'Διαθέσιμο'
        case 'Backorder':
            return 'Κατόπιν παραγγελίας'
        case 'IsExpected':
            return 'Αναμένεται σύντομα'
        case 'OutOfStock':
            return 'Εξαντλήθηκε — ενημερωθείτε όταν έρθει'
        case 'AskForPrice':
            return 'Ζητήστε τιμή'
        default:
            return null
    }
}

/** Το όνομα με τη μάρκα μπροστά (αν δεν την έχει ήδη) */
export function productDisplayName(p: Pick<SeoInput, 'name' | 'brand'>): string {
    const name = clean(p.name)
    const brand = clean(p.brand?.name)
    return brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name
}

export function autoProductTitle(p: SeoInput): string {
    const base = productDisplayName(p)
    const category = clean(p.category?.name)
    if (category && !base.toLowerCase().includes(category.toLowerCase()) && base.length + category.length + 3 <= TITLE_MAX) {
        return `${base} – ${category}`
    }
    return cut(base, TITLE_MAX + 12)
}

export function autoProductDescription(p: SeoInput): string {
    const name = productDisplayName(p)
    const chars = charPhrases(p.prod_chars, name)
    const parts: string[] = [chars.length ? `${name}: ${chars.join(', ')}.` : `${name}.`]

    const availability = availabilityText(p)
    if (availability) parts.push(`${availability}.`)

    if (p.status !== 'AskForPrice') {
        const price = Number(p.price) || 0
        const sale = Number(p.sale_price) || 0
        if (p.is_sale && sale > 0 && sale < price) parts.push(`Τιμή ${euro(sale)} (από ${euro(price)}).`)
        else if (price > 0) parts.push(`Τιμή ${euro(price)}.`)
    }

    let text = parts.join(' ')
    // Χωρίς χαρακτηριστικά: λίγο από τη σύντομη περιγραφή, αν χωράει
    if (!chars.length && text.length < DESC_MAX - 40) {
        const extra = plainText(p.short_description ?? '', 400)
        if (extra) text = `${text} ${extra}`
    }
    return cut(text, DESC_MAX)
}
