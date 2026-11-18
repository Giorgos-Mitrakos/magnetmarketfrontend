'use client'
// Καλάθι: «Μην ξεχάσετε» — προτάσεις για τα προϊόντα του καλαθιού
// (χειροκίνητα «Ταιριάζει με» + συμπληρωματικές κατηγορίες, από το Strapi).
import { useEffect, useMemo, useState } from 'react'
import Carousel from '@/components/atoms/carousel'
import { useCheckout } from '@/context/checkout'
import { IProductCard } from '@/lib/interfaces/product'

export default function CartCrossSell() {
  const { checkout } = useCheckout()
  const [products, setProducts] = useState<IProductCard[]>([])

  // Αλλάζει μόνο όταν αλλάζουν τα προϊόντα (όχι οι ποσότητες)
  const key = useMemo(
    () =>
      Array.from(new Set((checkout.cart ?? []).map((i) => i.documentId).filter(Boolean) as string[])).sort().join(','),
    [checkout.cart]
  )

  useEffect(() => {
    const ids = key ? key.split(',') : []
    if (!ids.length) {
      setProducts([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/cross-sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds: ids, exclude: ids, limit: 8 }),
          signal: ctrl.signal,
        })
        const data = res.ok ? await res.json() : null
        setProducts(data?.products ?? [])
      } catch {
        // σιωπηλά
      }
    }, 300)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [key])

  if (!products.length) return null
  return (
    <section className="mt-8" aria-label="Μην ξεχάσετε">
      <h2 className="mb-4 text-xl font-bold text-siteColors-purple dark:text-slate-200">Μην ξεχάσετε</h2>
      <Carousel products={products} listName="Καλάθι: προτάσεις" listId="cart_cross_sell" />
    </section>
  )
}
