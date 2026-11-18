// lib/helpers/productRef.ts
// Οι φόρμες του site στέλνουν το αριθμητικό id του προϊόντος· το Strapi v3
// θέλει documentId. Μόνο στον server.
import { storefrontFetch } from "./storefrontApi";

export async function productDocumentIdOf(body: any): Promise<string | null> {
    const direct = body?.productDocumentId ?? body?.documentId
    if (typeof direct === 'string' && /^[a-z0-9]{10,40}$/i.test(direct)) return direct
    const id = String(body?.productId ?? '').trim()
    if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return null
    try {
        const res = await storefrontFetch<any>(`/storefront/product-price/${id}`)
        return res?.product?.data?.documentId ?? null
    } catch {
        return null
    }
}
