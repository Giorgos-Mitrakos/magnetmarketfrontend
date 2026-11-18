'use client'
// components/atoms/PriceAlertButton.tsx — «🔔 Ειδοποίηση τιμής» στη σελίδα προϊόντος.
// Το modal φορτώνει μόνο όταν πατηθεί το κουμπί.
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { FaBell } from 'react-icons/fa'

const PriceAlertModal = dynamic(() => import('@/components/modals/PriceAlertModal'), { ssr: false })

interface PriceAlertButtonProps {
    documentId?: string | null
    productName: string
    price?: number | null
    salePrice?: number | null
    isSale?: boolean
    status?: string
    className?: string
}

/** Χωρίς ειδοποίηση τιμής: «Ζητήστε τιμή», καταργημένα, χωρίς τιμή */
const NO_ALERT = ['AskForPrice', 'Discontinued']

export default function PriceAlertButton({ documentId, productName, price, salePrice, isSale, status, className = '' }: PriceAlertButtonProps) {
    const [open, setOpen] = useState(false)
    const base = Number(price) || 0
    const sale = isSale && salePrice ? Number(salePrice) : 0
    const current = sale > 0 && sale < base ? sale : base
    if (!documentId || !current || (status && NO_ALERT.includes(status))) return null

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-siteColors-lightblue/40 text-siteColors-blue dark:text-slate-100 font-semibold hover:bg-siteColors-lightblue/10 transition-colors ${className}`}
            >
                <FaBell aria-hidden="true" />
                <span>Ειδοποίηση όταν πέσει η τιμή</span>
            </button>
            {open && (
                <PriceAlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    productDocumentId={documentId}
                    productName={productName}
                    currentPrice={current}
                />
            )}
        </>
    )
}
