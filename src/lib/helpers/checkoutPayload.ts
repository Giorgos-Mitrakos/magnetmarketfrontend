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
        // (2026-11-26) Άρθρο 45: στο quote μόνο η ένδειξη (προεπισκόπηση τιμών χωρίς ΦΠΑ στις
        // επιλέξιμες γραμμές) — ο έλεγχος στην ΑΑΔΕ γίνεται στη δημιουργία της παραγγελίας
        article_45: article45Active(checkout) ? { is_tax_free: true } : undefined,
    }
}

/** Ενεργή επιλογή άρθρου 45: τιμολόγιο + το ίδιο ΑΦΜ με αυτό που ελέγχθηκε */
export function article45Active(checkout: ICheckoutState): boolean {
    const b = checkout.addresses.billing
    const a = checkout.article45
    return !!(a?.requested && b.isInvoice && normalizeAfmForAadeCheck(b.afm) === a.afm)
}

/** Α.Φ.Μ. χωρίς κενά / παύλες / πρόθεμα EL-GR (ίδιο με το normalizeAfm της φόρμας στοιχείων) */
export const normalizeAfmForAadeCheck = (v?: string | null) =>
    String(v ?? '').replace(/[\s\-.()/]/g, '').toUpperCase().replace(/^(EL|GR)/, '')

export function buildOrderPayload(checkout: ICheckoutState) {
    const a = checkout.article45
    return {
        ...buildQuotePayload(checkout),
        delivery_notes: s(checkout.addresses.deliveryNotes) || undefined,
        // (2026-11-26) Άρθρο 45: ΑΦΜ + (προαιρετικά) στοιχεία εκπροσώπου. Το Strapi ξαναελέγχει
        // στην ΑΑΔΕ και εφαρμόζει την απαλλαγή μόνο αν επιβεβαιωθεί.
        article_45: a && article45Active(checkout)
            ? {
                is_tax_free: true,
                afm: a.afm,
                ...(a.reprIdentityType && s(a.reprIdentityNo).length === 5
                    ? { repr_identity_type: Number(a.reprIdentityType), repr_identity_no: s(a.reprIdentityNo) }
                    : {}),
                ...(s(a.reprMobile) ? { repr_mobile: s(a.reprMobile).replace(/[\s-]/g, '') } : {}),
                ...(/^\d{6}$/.test(s(a.otpId)) ? { otp_id: s(a.otpId) } : {}),
            }
            : undefined,
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
