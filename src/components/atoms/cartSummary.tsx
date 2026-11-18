"use client"

import { useCheckout } from "@/context/checkout"
import FreeShippingBar from "@/components/atoms/FreeShippingBar"

export default function CartSummary() {
    const { checkout, dispatch } = useCheckout()
    
    const {
        subtotal,
        shipping,
        payment,
        interestCost,
        discount,
        total,
        islandVat,
        bundles = [],
        bundleDiscount = 0
    } = checkout.totals

    // (2026-10-23) Πακέτα «Αγοράστε τα μαζί»: χωριστή γραμμή ανά πακέτο· η «Έκπτωση»
    // που μένει είναι του κουπονιού
    const couponDiscount = Math.max(0, Math.round((discount - bundleDiscount) * 100) / 100)

    // Μειωμένος ΦΠΑ νησιών: το Strapi δίνει το υποσύνολο ήδη με 17%. Εδώ δείχνουμε
    // το υποσύνολο με τις τιμές του site (24%, ίδιο με τις γραμμές του καλαθιού)
    // και τη διαφορά ως ξεχωριστή γραμμή, ώστε τα ποσά να «βγαίνουν».
    const islandSaving = islandVat?.applied ? Number(islandVat.productsSaving ?? 0) : 0

    // Λίστα με τα στοιχεία του summary
    const summaryItems = [
        {
            key: 'subtotal',
            label: 'Μερικό σύνολο',
            value: Math.round((subtotal + islandSaving) * 100) / 100,
            alwaysShow: true,
            isDiscount: false
        },
        {
            key: 'islandVat',
            label: `Μειωμένος ΦΠΑ ${islandVat?.rate ?? 17}%${islandVat?.area ? ` (${islandVat.area})` : ''}`,
            value: islandSaving,
            alwaysShow: false,
            isDiscount: true,
            condition: islandSaving > 0
        },
        {
            key: 'shipping',
            label: 'Μεταφορικά',
            value: shipping,
            alwaysShow: false,
            isDiscount: false,
            condition: shipping !== 0 && shipping !== null,
            fallbackText: 'Υπολογίζεται κατά τη διάρκεια αγοράς'
        },
        {
            key: 'payment',
            label: checkout.paymentMethod?.attributes.name || 'Πληρωμή',
            value: payment,
            alwaysShow: false,
            isDiscount: false,
            condition: checkout.paymentMethod && payment > 0
        },
        {
            key: 'interest',
            label: 'Επιβαρύνσεις Τόκων',
            value: interestCost,
            alwaysShow: false,
            isDiscount: false,
            condition: interestCost > 0
        },
        ...bundles.map((b) => ({
            key: `bundle-${b.documentId}`,
            label: `Πακέτο «${b.name}» (−${b.percent}%${b.sets > 1 ? ` × ${b.sets}` : ''})`,
            value: b.amount,
            alwaysShow: false,
            isDiscount: true,
            condition: b.amount > 0
        })),
        {
            key: 'discount',
            label: bundles.length ? 'Κουπόνι' : 'Έκπτωση',
            value: couponDiscount,
            alwaysShow: false,
            isDiscount: true,
            condition: couponDiscount > 0
        }
    ]

    const formatCurrency = (value: number) => {
        return `${value.toFixed(2)} €`
    }

    return (
        <div className="p-4 space-y-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-siteColors-purple dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                Σύνοψη Παραγγελίας
            </h2>

            {/* Δωρεάν μεταφορικά: πόσα λείπουν (όχι όταν έχει ήδη επιλεγεί δωρεάν αποστολή) */}
            {!(shipping === 0 && checkout.shippingMethod) && <FreeShippingBar />}
            
            <ul className="space-y-3">
                {summaryItems.map((item) => {
                    if (!item.alwaysShow && !item.condition) return null
                    
                    return (
                        <li key={item.key} className="flex justify-between items-center">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                {item.label}:
                            </span>
                            <span className={`font-semibold ${item.isDiscount ? 'text-green-600 dark:text-green-400' : 'text-siteColors-purple dark:text-slate-200'}`}>
                                {item.value !== null ? (
                                    <>
                                        {item.isDiscount && '- '}
                                        {formatCurrency(item.value)}
                                    </>
                                ) : (
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {item.fallbackText}
                                    </span>
                                )}
                            </span>
                        </li>
                    )
                })}
                
                {/* Γραμμή ορίου πριν το σύνολο */}
                <li className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            Σύνολο:
                        </span>
                        <span className="font-bold text-lg text-siteColors-purple dark:text-slate-100">
                            {total ? formatCurrency(total) : '0.00 €'}
                        </span>
                    </div>
                </li>
            </ul>
            
            {/* Μειωμένος ΦΠΑ νησιών: εφαρμόστηκε ή γιατί όχι */}
            {islandVat?.eligible && (
                <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg cursor-pointer">
                    <input
                        type="checkbox"
                        className="mt-1"
                        checked={!!checkout.islandVatDeclared}
                        onChange={(e) => dispatch({ type: "SET_ISLAND_VAT_DECLARED", payload: e.target.checked })}
                    />
                    <span>
                        <span className="font-medium">Μειωμένος ΦΠΑ νησιών:</span> {islandVat.declaration}
                    </span>
                </label>
            )}
            {islandVat?.applied && (
                <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    ✔️ Πληρώνετε ΦΠΑ {islandVat.rate}% αντί για 24% στα προϊόντα{islandVat.area ? ` (${islandVat.area})` : ''}.
                    Οι τιμές των προϊόντων εμφανίζονται με 24% και η διαφορά αφαιρείται παραπάνω·
                    {' '}τα μεταφορικά και η αντικαταβολή μένουν ίδια. Το τιμολόγιο εκδίδεται με ΦΠΑ {islandVat.rate}%.
                    {islandVat.reviewRequired && ' Πριν την έκδοση του τιμολογίου θα σας ζητήσουμε βεβαίωση έναρξης δραστηριότητας ή υποκαταστήματος στο νησί.'}
                </div>
            )}
            {islandVat && !islandVat.applied && islandVat.message && (
                <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    ℹ️ {islandVat.message}
                </div>
            )}

            {/* Εμφάνιση μηνύματος για δωρεάν αποστολή */}
            {shipping === 0 && checkout.shippingMethod && (
                <div className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                    ✔️ Δωρεάν αποστολή
                </div>
            )}
        </div>
    )
}