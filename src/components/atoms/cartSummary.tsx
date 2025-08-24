"use client"

import { useCheckout } from "@/context/checkout"

export default function CartSummary() {
    const { checkout } = useCheckout()
    
    const {
        subtotal,
        shipping,
        payment,
        interestCost,
        discount,
        total
    } = checkout.totals

    // Λίστα με τα στοιχεία του summary
    const summaryItems = [
        {
            key: 'subtotal',
            label: 'Μερικό σύνολο',
            value: subtotal,
            alwaysShow: true,
            isDiscount: false
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
        {
            key: 'discount',
            label: 'Έκπτωση',
            value: discount,
            alwaysShow: false,
            isDiscount: true,
            condition: discount > 0
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
            
            {/* Εμφάνιση μηνύματος για δωρεάν αποστολή */}
            {shipping === 0 && checkout.shippingMethod && (
                <div className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                    ✔️ Δωρεάν αποστολή
                </div>
            )}
        </div>
    )
}