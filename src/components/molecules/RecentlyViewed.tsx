'use client'
// «Είδατε πρόσφατα» — εμφανίζεται μόνο σε όποιον έχει δει προϊόντα.
// Οι κάρτες φορτώνουν όταν η ενότητα πλησιάσει στην οθόνη (δεν επιβαρύνει
// την αρχική φόρτωση της σελίδας).
import { useEffect, useRef, useState } from 'react'
import Carousel from '@/components/atoms/carousel'
import { IProductCard } from '@/lib/interfaces/product'
import { getRecentlyViewed } from '@/lib/helpers/recentlyViewed'

export default function RecentlyViewed({
  excludeDocumentId,
  title = 'Είδατε πρόσφατα',
}: {
  excludeDocumentId?: string | null
  title?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [products, setProducts] = useState<IProductCard[]>([])

  useEffect(() => {
    const ids = getRecentlyViewed().filter((id) => id !== excludeDocumentId)
    if (!ids.length || !ref.current) return

    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/wishlist/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds: ids }),
        })
        if (!res.ok) return
        const data = await res.json()
        // Ίδια σειρά με το ιστορικό (πιο πρόσφατο πρώτο)
        const byId = new Map<string, IProductCard>((data?.products ?? []).map((p: IProductCard) => [p.documentId, p]))
        const list = ids.map((id) => byId.get(id)).filter(Boolean) as IProductCard[]
        if (!cancelled) setProducts(list)
      } catch {
        // σιωπηλά — η ενότητα απλώς δεν εμφανίζεται
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          load()
        }
      },
      { rootMargin: '400px 0px' }
    )
    io.observe(ref.current)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [excludeDocumentId])

  return (
    <section ref={ref} aria-label={title} className={products.length ? 'my-8' : ''}>
      {products.length > 0 && (
        <>
          <h2 className="mb-4 text-xl md:text-2xl font-bold text-siteColors-purple dark:text-slate-200">{title}</h2>
          <Carousel products={products} listName={title} listId="recently_viewed" />
        </>
      )}
    </section>
  )
}
