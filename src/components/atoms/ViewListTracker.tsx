'use client'
// components/atoms/ViewListTracker.tsx
//
// Στέλνει το «view_item_list» στο Analytics ΜΙΑ φορά, όταν η λίστα φανεί
// πραγματικά στην οθόνη (τουλάχιστον 30%) — όχι για λίστες που ο πελάτης
// δεν έφτασε ποτέ να δει.
import { ReactNode, useEffect, useRef } from 'react'
import { trackViewItemList } from '@/lib/helpers/advanced-analytics'
import { IProductCard } from '@/lib/interfaces/product'

interface ViewListTrackerProps {
    products: IProductCard[]
    listName: string
    listId: string
    children: ReactNode
}

export default function ViewListTracker({ products, listName, listId, children }: ViewListTrackerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const sent = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el || sent.current || !products?.length) return
        if (typeof IntersectionObserver === 'undefined') return

        const observer = new IntersectionObserver(
            entries => {
                if (entries.some(e => e.isIntersecting) && !sent.current) {
                    sent.current = true
                    trackViewItemList(products, listName, listId)
                    observer.disconnect()
                }
            },
            { threshold: 0.3 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [products, listName, listId])

    return <div ref={ref}>{children}</div>
}
