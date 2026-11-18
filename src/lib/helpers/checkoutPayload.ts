// lib/helpers/checkoutPayload.ts
//
// Μετατροπή της κατάστασης του ταμείου (context) στη μορφή που δέχεται το
// Strapi v3 για quote / παραγγελία. Στέλνονται ΜΟΝΟ επιλογές του πελάτη
// (προϊόντα + ποσότητες, διευθύνσεις, documentId αποστολής/πληρωμής, δόσεις,
// κουπόνι) — ποτέ τιμές ή κόστη: αυτά τα υπολογίζει πάντα το Strapi.
import { AppliedBundle, ICheckoutState, IslandVatInfo } from "../interfaces/shipping"

type BillingState = ICheckoutState['addresses']['billing']
type ShippingState = ICheckoutState['addresses']['shipping']

const s = (v: unknown) => (v == null ? '' : String(v).trim())

export function billingToStrapi(b: BillingState) {
    return {
        firstname: s(b.firstname),
        lastname: s(b.lastname),
        email_address: s(b.email),
        telephone: s(b.telephone),
        mobilePhone: s(b.mobilePhone),
        street: s(b.street),
        city: s(b.city),
        state: s(b.state),
        zipCode: s(b.zipCode),
        country: s(b.country) || 'Ελλάδα',
        isInvoice: !!b.isInvoice,
        afm: b.isInvoice ? s(b.afm) : '',
        doy: b.isInvoice ? s(b.doy) : '',
        companyName: b.isInvoice ? s(b.companyName) : '',
        businessActivity: b.isInvoice ? s(b.businessActivity) : '',
    }
}

export function shippingToStrapi(a: ShippingState) {
    return {
        firstname: s(a.firstname),
        lastname: s(a.lastname),
        telephone: s(a.telephone),
        mobilePhone: s(a.mobilePhone),
        street: s(a.street),
        city: s(a.city),
        state: s(a.state),
        zipCode: s(a.zipCode),
        country: s(a.country) || 'Ελλάδα',
    }
}

/** Γραμμές καλαθιού: documentId όταν υπάρχει, αλλιώς το αριθμητικό id */
export function cartItemsToStrapi(cart: ICheckoutState['cart']) {
    return cart.map(item => ({
        ...(item.documentId ? { productDocumentId: item.documentId } : { id: item.id }),
        quantity: Number(item.quantity),
        name: item.name,
        ...(item.preorderToken ? { preorderToken: item.preorderToken } : {}),
    }))
}

export function buildQuotePayload(checkout: ICheckoutState, couponCode?: string | null) {
    const shippingId = checkout.shippingMethod?.id ?? null
    const paymentId = shippingId ? checkout.paymentMethod?.id ?? null : null
    return {
        items: cartItemsToStrapi(checkout.cart),
        billing_address: billingToStrapi(checkout.addresses.billing),
        different_shipping: !!checkout.addresses.different_shipping,
        // Τιμολόγιο + ΑΦΜ: για τον μειωμένο ΦΠΑ νησιών
        is_invoice: !!checkout.addresses.billing.isInvoice,
        island_vat_declared: !!checkout.islandVatDeclared,
        shipping_address: checkout.addresses.different_shipping
            ? shippingToStrapi(checkout.addresses.shipping)
            : undefined,
        shippingDocumentId: shippingId ? String(shippingId) : undefined,
        paymentDocumentId: paymentId ? String(paymentId) : undefined,
        installmentsCount: paymentId ? Math.max(1, Number(checkout.installments) || 1) : 1,
        couponCode: couponCode ?? checkout.appliedCoupon?.code ?? undefined,
    }
}

export function buildOrderPayload(checkout: ICheckoutState) {
    return {
        ...buildQuotePayload(checkout),
        delivery_notes: s(checkout.addresses.deliveryNotes) || undefined,
    }
}

/** Απάντηση του /api/checkout/quote (ίδια με το /api/orders/quote του Strapi) */
export interface IQuoteResponse {
    subtotal: number
    discount: number
    shippingCost: number
    paymentCost: number
    vatTotal: number
    total: number
    monthlyInstallment: number | null
    coupon: { code: string, discountType: 'percentage' | 'fixed_amount' | 'free_shipping', discountValue: number, isFreeShipping: boolean } | null
    couponError: string | null
    warnings: string[]
    /** Μειωμένος ΦΠΑ νησιών (τιμολόγιο επιχείρησης με έδρα στο νησί) */
    islandVat?: IslandVatInfo | null
    /** (2026-10-23) Μέρος του discount από πακέτα «Αγοράστε τα μαζί» */
    bundleDiscount?: number
    bundles?: AppliedBundle[]
}
