'use client'
// «Προτάσεις για εσάς»: με βάση τα προϊόντα που είδε ο επισκέπτης (ιστορικό
// στον browser του). Όποιος δεν έχει ιστορικό δεν βλέπει τίποτα.
// Φορτώνει όταν η ενότητα πλησιάσει στην οθόνη (δεν βαραίνει την αρχική φόρτωση).
import { useEffect, useRef, useState } from 'react'
import Carousel from '@/components/atoms/carousel'
import ViewListTracker from '@/components/atoms/ViewListTracker'
import { IProductCard } from '@/lib/interfaces/product'
import { getRecentlyViewed } from '@/lib/helpers/recentlyViewed'

export default function ForYou({
  id,
  title,
  subtitle,
  limit = 8,
}: {
  id: string
  title: string
  subtitle?: string | null
  limit?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const [products, setProducts] = useState<IProductCard[]>([])

  useEffect(() => {
    const viewed = getRecentlyViewed()
    if (!viewed.length || !ref.current) return

    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/for-you', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ viewed, limit }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setProducts(Array.isArray(data?.products) ? data.products : [])
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
  }, [limit])

  const listId = `homepage_for_you_${id}`

  return (
    <section id={id} ref={ref} aria-label={title} className={products.length ? 'my-8' : ''}>
      {products.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-siteColors-purple dark:text-slate-200 md:text-2xl">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
          <ViewListTracker products={products} listName={title} listId={listId}>
            <Carousel products={products} listName={title} listId={listId} />
          </ViewListTracker>
        </>
      )}
    </section>
  )
}
