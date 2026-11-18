'use client'
/**
 * (2026-10-23) Πακέτα «Αγοράστε τα μαζί» με έκπτωση.
 * Τα ορίζει ο Product Manager (προϊόν → «Πακέτα με έκπτωση»). Το κουμπί βάζει
 * όλα τα προϊόντα στο καλάθι· την έκπτωση την υπολογίζει το Strapi στο καλάθι /
 * στην παραγγελία (αυτόματα, όσο υπάρχουν όλα τα προϊόντα του πακέτου).
 */
import Image from 'next/image'
import Link from 'next/link'
import { FaPlus, FaCartShopping } from 'react-icons/fa6'
import { toast } from 'sonner'
import { useCheckout } from '@/context/checkout'
import { getStrapiMedia } from '@/repositories/medias'
import type { ICartItem } from '@/lib/interfaces/cart'
import type { IProductBundle } from '@/lib/interfaces/product'

const euro = (n: number) => `${n.toFixed(2)} €`

function BundleCard({ bundle, currentDocumentId }: { bundle: IProductBundle; currentDocumentId?: string }) {
  const { dispatch } = useCheckout()

  const addAll = () => {
    for (const it of bundle.items) {
      const p = it.product
      const item: ICartItem = {
        id: p.id,
        documentId: p.documentId,
        name: p.name,
        slug: p.slug,
        status: p.status,
        image: p.image as ICartItem['image'],
        weight: p.weight,
        price: p.price,
        brand: p.brand?.name || null,
        quantity: it.quantity,
        isAvailable: true,
        is_sale: p.is_sale,
        sale_price: p.sale_price,
        category: p.category,
      }
      dispatch({ type: 'ADD_ITEM', payload: item })
    }
    toast.success(`Το πακέτο «${bundle.name}» μπήκε στο καλάθι — η έκπτωση ${euro(bundle.saving)} φαίνεται στο σύνολο.`)
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-600">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{bundle.name}</h3>
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">−{bundle.percent.toLocaleString('el-GR')}%</span>
      </div>

      <ul className="mt-4 flex flex-wrap items-stretch gap-2">
        {bundle.items.map((it, i) => {
          const p = it.product
          const img = getStrapiMedia(p.image?.formats?.thumbnail?.url || p.image?.url)
          const isCurrent = p.documentId === currentDocumentId
          return (
            <li key={p.documentId ?? p.id} className="flex items-center gap-2">
              {i > 0 && <FaPlus className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />}
              <Link
                href={`/product/${p.slug}`}
                className={`flex w-36 flex-col rounded-lg border p-2 text-center transition hover:shadow ${isCurrent ? 'border-siteColors-purple/40 bg-slate-50 dark:bg-slate-700/40' : 'border-slate-200 dark:border-slate-600'}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span className="relative mx-auto block h-20 w-20">
                  {img && <Image src={img} alt={p.name} fill sizes="80px" className="object-contain" />}
                </span>
                <span className="mt-2 line-clamp-2 min-h-[2.5em] text-xs text-slate-700 dark:text-slate-200">
                  {it.quantity > 1 ? `${it.quantity}× ` : ''}
                  {p.name}
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{euro(it.unitPrice)}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 line-through dark:text-slate-400">{euro(bundle.total)}</p>
          <p className="text-xl font-bold text-siteColors-purple dark:text-slate-100">
            {euro(bundle.bundlePrice)}{' '}
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">κερδίζετε {euro(bundle.saving)}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Η έκπτωση εφαρμόζεται αυτόματα στο καλάθι, όσο υπάρχουν όλα τα προϊόντα του πακέτου.
          </p>
        </div>
        <button
          type="button"
          onClick={addAll}
          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-siteColors-purple px-5 py-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <FaCartShopping aria-hidden /> Προσθήκη όλων στο καλάθι
        </button>
      </div>
    </div>
  )
}

export default function ProductBundles({ bundles, currentDocumentId }: { bundles: IProductBundle[]; currentDocumentId?: string }) {
  if (!bundles.length) return null
  return (
    <section aria-labelledby="product-bundles-title" className="rounded-xl bg-white p-6 dark:bg-gray-800">
      <h2 id="product-bundles-title" className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Αγοράστε τα μαζί
      </h2>
      <div className="space-y-4">
        {bundles.map(b => (
          <BundleCard key={b.documentId} bundle={b} currentDocumentId={currentDocumentId} />
        ))}
      </div>
    </section>
  )
}
