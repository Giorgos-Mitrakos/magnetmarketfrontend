'use client'
/** (2026-10-23) Πίνακας σύγκρισης — «μόνο διαφορές», αφαίρεση, προσθήκη στο καλάθι */
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaXmark, FaCartShopping } from 'react-icons/fa6'
import { toast } from 'sonner'
import { getStrapiMedia } from '@/repositories/medias'
import { useCheckout } from '@/context/checkout'
import { getAvailabilityClasses, getAvailabilityInfo, type ProductStatus } from '@/lib/helpers/availabilityHelper'
import { compareUrl, removeFromCompare, useCompare, toggleCompare } from '@/lib/helpers/compareStore'
import type { ICartItem } from '@/lib/interfaces/cart'
import type { IProductCard } from '@/lib/interfaces/product'

export interface CompareData {
  products: IProductCard[]
  rows: { name: string; values: (string | null)[] }[]
}

const euro = (n: number) => `${n.toFixed(2).replace('.', ',')} €`
const norm = (v: string | null) => (v ?? '').trim().toLocaleLowerCase('el-GR')

export default function CompareTable({ data }: { data: CompareData }) {
  const router = useRouter()
  const { dispatch } = useCheckout()
  const stored = useCompare()
  const [onlyDiff, setOnlyDiff] = useState(false)
  const { products, rows } = data

  // Ο σύνδεσμος σύγκρισης (π.χ. κοινοποιημένος) γεμίζει και τη λίστα του browser
  useEffect(() => {
    if (stored.length) return
    for (const p of products) {
      if (!p.documentId) continue
      toggleCompare({ documentId: p.documentId, slug: p.slug, name: p.name, image: p.image?.formats?.thumbnail?.url || p.image?.url || null, category: p.category?.name ?? null })
    }
    // μόνο μία φορά
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleRows = useMemo(
    () => (onlyDiff ? rows.filter(r => new Set(r.values.map(norm)).size > 1) : rows),
    [rows, onlyDiff]
  )

  const remove = (documentId?: string) => {
    if (!documentId) return
    removeFromCompare(documentId)
    const rest = products.filter(p => p.documentId !== documentId)
    router.replace(rest.length ? compareUrl(rest as { documentId: string }[]) : '/compare')
  }

  const addToCart = (p: IProductCard) => {
    const item: ICartItem = {
      id: p.id, documentId: p.documentId, name: p.name, slug: p.slug, status: p.status,
      image: p.image as ICartItem['image'], weight: p.weight, price: p.price, brand: p.brand?.name || null,
      quantity: 1, isAvailable: true, is_sale: p.is_sale, sale_price: p.sale_price, category: p.category,
    }
    dispatch({ type: 'ADD_ITEM', payload: item })
    toast.success('Προστέθηκε στο καλάθι')
  }

  const canBuy = (p: IProductCard) => p.price != null && !['AskForPrice', 'IsExpected', 'OutOfStock', 'Discontinued'].includes(p.status)
  // (2026-10-28) Χωρίς οριζόντιο σκρολ: όλα χωράνε στο πλάτος της οθόνης.
  // Υπολογιστής/tablet: στήλη ετικετών + μία στήλη ανά προϊόν.
  // Κινητό: χωρίς στήλη ετικετών — το όνομα του χαρακτηριστικού πιάνει όλη τη γραμμή
  // και από κάτω οι τιμές των προϊόντων δίπλα-δίπλα (όπως στα κινητά των μεγάλων e-shop).
  const gridVars = {
    '--cmp-cols': `minmax(7rem,12rem) repeat(${products.length}, minmax(0,1fr))`,
    '--cmp-cols-m': `repeat(${products.length}, minmax(0,1fr))`,
  } as React.CSSProperties
  const cell = 'border-b border-slate-200 px-2 py-2 text-sm [overflow-wrap:anywhere] dark:border-slate-700 md:px-3'
  // Ετικέτα γραμμής: στο κινητό τίτλος σε όλο το πλάτος, στον υπολογιστή σταθερή αριστερή στήλη
  const rowHead = 'col-span-full bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 md:col-span-1 md:bg-white md:text-sm md:font-medium md:normal-case md:tracking-normal md:dark:bg-gray-800'

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={onlyDiff} onChange={e => setOnlyDiff(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Μόνο οι διαφορές
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">{visibleRows.length} χαρακτηριστικά</p>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800">
        <div className="grid [grid-template-columns:var(--cmp-cols-m)] md:[grid-template-columns:var(--cmp-cols)]" style={gridVars} role="table" aria-label="Σύγκριση προϊόντων">
          {/* Κεφαλίδα: προϊόντα (στο κινητό χωρίς τη λέξη «Προϊόν») */}
          <div className={`${cell} hidden bg-white font-semibold dark:bg-gray-800 md:block`} role="columnheader">Προϊόν</div>
          {products.map(p => {
            const img = getStrapiMedia(p.image?.formats?.small?.url || p.image?.url)
            const price = p.is_sale && p.sale_price ? p.sale_price : p.price
            const av = getAvailabilityInfo(p.status as ProductStatus, p.inventory, p.is_in_house)
            return (
              // (2026-10-28) Στήλη flex: τιμή, διαθεσιμότητα και κουμπί κάτω-κάτω, ώστε να είναι
              // στην ίδια ευθεία σε όλα τα προϊόντα όσες γραμμές κι αν πιάνει το όνομα
              <div key={p.documentId ?? p.id} className={`${cell} relative flex flex-col`} role="columnheader">
                <button type="button" onClick={() => remove(p.documentId)} aria-label={`Αφαίρεση: ${p.name}`} className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:bg-gray-800/80 dark:hover:bg-slate-700 md:right-2 md:top-2">
                  <FaXmark aria-hidden />
                </button>
                <Link href={`/product/${p.slug}`} className="block">
                  <span className="relative mx-auto block h-16 w-16 xs:h-20 xs:w-20 md:h-28 md:w-28">
                    {img && <Image src={img} alt={p.name} fill sizes="(min-width: 768px) 112px, 80px" className="object-contain" />}
                  </span>
                  <span className="mt-2 line-clamp-3 text-xs font-medium text-slate-800 hover:underline dark:text-slate-100 md:text-sm">{p.name}</span>
                </Link>
                <div className="mt-auto pt-1">
                {price != null && (
                  <p className="mt-1 leading-tight">
                    <span className="text-sm font-bold text-siteColors-purple dark:text-slate-100 md:text-lg">{euro(price)}</span>
                    {p.is_sale && p.sale_price ? <span className="block text-xs text-slate-500 line-through md:ml-2 md:inline">{euro(p.price)}</span> : null}
                  </p>
                )}
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold md:text-xs ${getAvailabilityClasses(av.color)}`}>{av.message}</span>
                {canBuy(p) && (
                  <button type="button" onClick={() => addToCart(p)} aria-label={`Στο καλάθι: ${p.name}`} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-siteColors-purple px-2 py-2 text-sm font-semibold text-white hover:opacity-90 md:px-3">
                    <FaCartShopping aria-hidden /> <span className="hidden sm:inline">Στο καλάθι</span>
                  </button>
                )}
                </div>
              </div>
            )
          })}

          {/* Μάρκα */}
          <div className={`${cell} ${rowHead}`} role="rowheader">Κατασκευαστής</div>
          {products.map(p => <div key={`b${p.documentId}`} className={cell} role="cell">{p.brand?.name ?? '—'}</div>)}

          {/* Χαρακτηριστικά */}
          {visibleRows.map((r, i) => {
            const differs = new Set(r.values.map(norm)).size > 1
            const zebra = i % 2 ? 'bg-slate-50/60 dark:bg-slate-700/20' : ''
            return [
              <div key={`h${r.name}`} className={`${cell} ${rowHead}`} role="rowheader">{r.name}</div>,
              ...r.values.map((v, j) => (
                <div key={`${r.name}-${j}`} className={`${cell} ${zebra} ${differs ? 'text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-300'}`} role="cell">
                  {v ?? <span className="text-slate-400">—</span>}
                </div>
              )),
            ]
          })}
        </div>
      </div>
      {visibleRows.length === 0 && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{onlyDiff ? 'Δεν υπάρχουν διαφορές στα καταγεγραμμένα χαρακτηριστικά.' : 'Δεν υπάρχουν καταγεγραμμένα χαρακτηριστικά για αυτά τα προϊόντα.'}</p>
      )}
    </div>
  )
}
