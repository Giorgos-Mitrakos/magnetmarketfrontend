'use client'
// Παράθυρο μετά την «Προσθήκη στο καλάθι»: επιβεβαίωση + «Συχνά αγοράζονται
// μαζί» (cross-selling). Αν δεν υπάρχουν προτάσεις — ή είμαστε ήδη στο καλάθι
// / στο ταμείο — εμφανίζεται μόνο το συνηθισμένο toast.
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaCheck, FaRegImage, FaXmark } from 'react-icons/fa6'
import { useCheckout } from '@/context/checkout'
import { getStrapiMedia } from '@/repositories/medias'
import { ICartItem } from '@/lib/interfaces/cart'
import { IProductCard } from '@/lib/interfaces/product'
import { addToCartToast } from '@/lib/toasts/cartToasts'
import {
  ADDED_TO_CART_EVENT,
  cardToCartItem,
  registerCrossSellListener,
} from '@/lib/helpers/crossSellEvents'

const TIMEOUT_MS = 1500
const money = (n: number) => n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
const priceOf = (p: { is_sale?: boolean; sale_price?: number | null; price: number }) =>
  p.is_sale && p.sale_price ? p.sale_price : p.price
const thumb = (img: any) => (img ? getStrapiMedia(img.formats?.thumbnail?.url || img.url) : null)

export default function CrossSellDialog() {
  const { checkout, dispatch } = useCheckout()
  const pathname = usePathname()
  const [added, setAdded] = useState<ICartItem | null>(null)
  const [products, setProducts] = useState<IProductCard[]>([])
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const closeRef = useRef<HTMLButtonElement>(null)
  const cartRef = useRef(checkout.cart)
  cartRef.current = checkout.cart
  const pathRef = useRef(pathname)
  pathRef.current = pathname

  const close = useCallback(() => {
    setAdded(null)
    setProducts([])
    setAddedIds(new Set())
  }, [])

  useEffect(() => {
    const unregister = registerCrossSellListener()
    const onAdded = async (e: Event) => {
      const item = (e as CustomEvent<ICartItem>).detail
      const path = pathRef.current || ''
      if (!item?.documentId || path.startsWith('/shopping-cart') || path.startsWith('/checkout')) {
        addToCartToast(item)
        return
      }
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
      try {
        const inCart = (cartRef.current ?? []).map((c) => c.documentId).filter(Boolean)
        const res = await fetch('/api/cross-sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds: [item.documentId], exclude: inCart, limit: 4 }),
          signal: ctrl.signal,
        })
        const data = res.ok ? await res.json() : null
        const list: IProductCard[] = data?.products ?? []
        if (!list.length) {
          addToCartToast(item)
          return
        }
        setAddedIds(new Set())
        setProducts(list.slice(0, 4))
        setAdded(item)
      } catch {
        addToCartToast(item)
      } finally {
        clearTimeout(timer)
      }
    }
    window.addEventListener(ADDED_TO_CART_EVENT, onAdded)
    return () => {
      unregister()
      window.removeEventListener(ADDED_TO_CART_EVENT, onAdded)
    }
  }, [])

  // Esc κλείνει· εστίαση στο κουμπί κλεισίματος
  useEffect(() => {
    if (!added) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [added, close])

  // Αλλαγή σελίδας → κλείνει
  useEffect(() => {
    close()
  }, [pathname, close])

  if (!added) return null

  const addSuggestion = (p: IProductCard) => {
    if (!p.documentId || addedIds.has(p.documentId)) return
    dispatch({ type: 'ADD_ITEM', payload: cardToCartItem(p) })
    setAddedIds((s) => new Set(s).add(p.documentId!))
  }

  const addedImg = thumb(added.image)

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cross-sell-title"
        className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg border border-slate-200 bg-white">
            {addedImg ? (
              <Image src={addedImg} alt={added.name} fill sizes="64px" className="object-contain p-1" />
            ) : (
              <FaRegImage className="m-auto h-8 w-8 text-slate-300" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p id="cross-sell-title" className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
              <FaCheck aria-hidden="true" /> Προστέθηκε στο καλάθι
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">{added.name}</p>
            {/* (2026-10-28) Με την ποσότητα που προστέθηκε (πριν: πάντα η τιμή ενός τεμαχίου) */}
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">
              {(added.quantity ?? 1) > 1 ? (
                <>
                  {added.quantity} × {money(priceOf(added))}{' '}
                  <span className="font-normal text-slate-500 dark:text-slate-400">= {money(priceOf(added) * added.quantity)}</span>
                </>
              ) : (
                money(priceOf(added))
              )}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Κλείσιμο"
          >
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <div className="p-4">
          <h2 className="mb-3 text-lg font-bold text-siteColors-purple dark:text-slate-200">Συχνά αγοράζονται μαζί</h2>
          <ul className="space-y-3">
            {products.map((p) => {
              const img = thumb(p.image)
              const isAdded = !!p.documentId && addedIds.has(p.documentId)
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                  <Link href={`/product/${p.slug}`} onClick={close} className="relative h-14 w-14 flex-shrink-0 rounded bg-white">
                    {img ? (
                      <Image src={img} alt={p.name} fill sizes="56px" className="object-contain p-1" />
                    ) : (
                      <FaRegImage className="m-auto h-6 w-6 text-slate-300" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={close}
                      className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-siteColors-pink dark:text-slate-100"
                    >
                      {p.name}
                    </Link>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {money(priceOf(p))}
                      {p.is_sale && p.sale_price ? (
                        <span className="ml-2 text-xs font-normal text-slate-400 line-through">{money(p.price)}</span>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addSuggestion(p)}
                    disabled={isAdded}
                    className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isAdded
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-gradient-to-br from-siteColors-lightblue to-siteColors-blue text-white hover:from-siteColors-pink hover:to-siteColors-purple'
                    }`}
                    aria-label={isAdded ? `${p.name}: στο καλάθι` : `Προσθήκη στο καλάθι: ${p.name}`}
                  >
                    {isAdded ? '✓ Στο καλάθι' : '+ Προσθήκη'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 dark:border-slate-700 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Συνέχεια αγορών
          </button>
          <Link
            href="/shopping-cart"
            onClick={close}
            className="rounded-lg bg-gradient-to-r from-siteColors-purple to-siteColors-pink px-4 py-2 text-center font-semibold text-white hover:opacity-90"
          >
            Μετάβαση στο καλάθι
          </Link>
        </div>
      </div>
    </div>
  )
}
