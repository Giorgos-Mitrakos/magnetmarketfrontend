// lib/helpers/slimProduct.ts  (2026-11-26)
//
// Ελαφριά μορφή προϊόντος για τις ΚΑΡΤΕΣ (λίστες, carousel, αρχική).
// Τα δεδομένα που περνάνε σε client components γράφονται ΔΥΟ φορές μέσα στη σελίδα
// (HTML + δεδομένα του React), άρα κάθε περιττό πεδίο κοστίζει διπλά. Κρατάμε ό,τι
// χρησιμοποιούν η κάρτα, το καλάθι (από το κουμπί της κάρτας), τα αγαπημένα, η σύγκριση
// και τα analytics· η εικόνα μόνο με τα 2 μεγέθη που χρησιμοποιούνται (small, thumbnail).
import { IProductCard } from '@/lib/interfaces/product'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slimImage = (img: any) => {
    if (!img?.url) return img ?? null
    const formats: AnyObj = {}
    if (img.formats?.small?.url) formats.small = { url: img.formats.small.url }
    if (img.formats?.thumbnail?.url) formats.thumbnail = { url: img.formats.thumbnail.url }
    return {
        url: img.url,
        alternativeText: img.alternativeText ?? null,
        ...(Object.keys(formats).length ? { formats } : {}),
    }
}

// Κατηγορία: όνομα/slug + αλυσίδα γονέων (για analytics: item_category 1–3)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slimCategory = (c: any): AnyObj | null =>
    c ? { id: c.id, name: c.name, slug: c.slug, parents: (c.parents ?? []).map(slimCategory) } : null

export function slimProductCard<T extends IProductCard | null | undefined>(p: T): T {
    if (!p || typeof p !== 'object') return p
    const src = p as unknown as AnyObj
    const out: AnyObj = {
        id: src.id,
        documentId: src.documentId,
        name: src.name,
        slug: src.slug,
        price: src.price,
        sale_price: src.sale_price,
        is_sale: src.is_sale,
        sale_ends_at: src.sale_ends_at,
        previous_price: src.previous_price,
        is_new: src.is_new,
        badges: src.badges,
        status: src.status,
        inventory: src.inventory,
        is_in_house: src.is_in_house,
        weight: src.weight,
        image: slimImage(src.image),
        brand: src.brand
            ? { name: src.brand.name, slug: src.brand.slug, logo: src.brand.logo ? slimImage(src.brand.logo) : null }
            : null,
        category: slimCategory(src.category),
        link: src.link,
    }
    // Χωρίς undefined (δεν γράφονται καν στη σελίδα)
    for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k]
    return out as unknown as T
}

export const slimProductCards = <T extends IProductCard>(list: T[] | null | undefined): T[] =>
    Array.isArray(list) ? list.map((p) => slimProductCard(p)) : []
