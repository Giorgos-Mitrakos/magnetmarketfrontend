'use client'
/**
 * (2026-10-23) Αξιολογήσεις στη σελίδα προϊόντος — μόνο από επαληθευμένες αγορές.
 * Ο πελάτης παίρνει πρόσκληση με email μετά την ολοκλήρωση της παραγγελίας
 * (Strapi: api/product-review). Διακόπτης: Product Manager → Ρυθμίσεις → «Αξιολογήσεις».
 */
import { useState } from 'react'
import { FaCircleCheck, FaChevronDown } from 'react-icons/fa6'
import Stars from './Stars'
import type { IProductReview, IProductReviews } from '@/lib/interfaces/product'

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const avgText = (n: number) => n.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function ProductReviews({ data, productDocumentId }: { data: IProductReviews; productDocumentId?: string }) {
  const { summary } = data
  const [items, setItems] = useState<IProductReview[]>(data.results)
  const [page, setPage] = useState(data.pagination.page)
  const [pageCount, setPageCount] = useState(data.pagination.pageCount)
  const [total, setTotal] = useState(data.pagination.total)
  const [rating, setRating] = useState<number | null>(null)
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [loading, setLoading] = useState(false)

  const fetchPage = async (next: { page: number; rating: number | null; sort: string }, append: boolean) => {
    if (!productDocumentId) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({ product: productDocumentId, page: String(next.page), pageSize: '5', sort: next.sort })
      if (next.rating) qs.set('rating', String(next.rating))
      const res = await fetch(`/api/reviews/list?${qs.toString()}`)
      const json = await res.json()
      const d = json?.data
      if (!res.ok || !d) throw new Error()
      setItems(prev => (append ? [...prev, ...d.results] : d.results))
      setPage(d.pagination.page)
      setPageCount(d.pagination.pageCount)
      setTotal(d.pagination.total)
    } catch {
      /* κρατάμε ό,τι υπάρχει */
    } finally {
      setLoading(false)
    }
  }

  const filterBy = (n: number | null) => {
    const r = n === rating ? null : n
    setRating(r)
    fetchPage({ page: 1, rating: r, sort }, false)
  }

  return (
    <section id="reviews" aria-labelledby="product-reviews-title" className="scroll-mt-24 rounded-xl bg-white p-6 dark:bg-gray-800">
      <h2 id="product-reviews-title" className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Αξιολογήσεις{summary.count ? ` (${summary.count})` : ''}
      </h2>

      {summary.count === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Δεν υπάρχουν ακόμα αξιολογήσεις. Όσοι αγοράζουν το προϊόν από εμάς παίρνουν πρόσκληση να το αξιολογήσουν.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
          {/* Σύνοψη */}
          <div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{avgText(summary.average ?? 0)}</span>
              <div className="pb-1">
                <Stars value={summary.average ?? 0} size="md" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{summary.count} {summary.count === 1 ? 'αξιολόγηση' : 'αξιολογήσεις'}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map(n => {
                const c = summary.distribution[String(n) as '5'] ?? 0
                const pct = summary.count ? Math.round((c / summary.count) * 100) : 0
                const active = rating === n
                return (
                  <li key={n}>
                    <button
                      type="button"
                      disabled={!c}
                      onClick={() => filterBy(n)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-sm transition disabled:cursor-default ${active ? 'bg-amber-50 dark:bg-amber-900/20' : 'enabled:hover:bg-slate-50 dark:enabled:hover:bg-slate-700/40'}`}
                    >
                      <span className="w-7 shrink-0 text-left text-slate-600 dark:text-slate-300">{n}★</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                        <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">{c}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <FaCircleCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
              Όλες οι αξιολογήσεις είναι από πελάτες που αγόρασαν το προϊόν από εμάς. Δημοσιεύουμε θετικές και αρνητικές — αφαιρούμε μόνο ακατάλληλο περιεχόμενο.
            </p>
          </div>

          {/* Λίστα */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {rating ? `${total} με ${rating}★` : `${total} αξιολογήσεις`}
                {rating && (
                  <button type="button" onClick={() => filterBy(null)} className="ml-2 underline underline-offset-2">όλες</button>
                )}
              </p>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                Ταξινόμηση
                <select
                  value={sort}
                  onChange={e => {
                    const s = e.target.value as typeof sort
                    setSort(s)
                    fetchPage({ page: 1, rating, sort: s }, false)
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                >
                  <option value="newest">Πιο πρόσφατες</option>
                  <option value="highest">Υψηλότερη βαθμολογία</option>
                  <option value="lowest">Χαμηλότερη βαθμολογία</option>
                </select>
              </label>
            </div>

            <ul className={`divide-y divide-slate-200 dark:divide-slate-700 ${loading ? 'opacity-60' : ''}`}>
              {items.map(r => (
                <li key={r.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} size="sm" />
                    {r.title && <span className="font-semibold text-slate-800 dark:text-slate-100">{r.title}</span>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{r.name}</span>
                    <span>· {fmtDate(r.date)}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                        · <FaCircleCheck className="h-3 w-3" aria-hidden /> Επαληθευμένη αγορά
                      </span>
                    )}
                  </p>
                  {r.body && <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{r.body}</p>}
                  {r.reply && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-700/40">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Απάντηση Magnet Market{r.replyAt ? ` · ${fmtDate(r.replyAt)}` : ''}</p>
                      <p className="mt-1 whitespace-pre-line text-slate-700 dark:text-slate-200">{r.reply}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {page < pageCount && (
              <button
                type="button"
                disabled={loading}
                onClick={() => fetchPage({ page: page + 1, rating, sort }, true)}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-siteColors-purple underline-offset-2 hover:underline disabled:opacity-60 dark:text-slate-200"
              >
                {loading ? 'Φόρτωση…' : 'Περισσότερες αξιολογήσεις'}
                <FaChevronDown className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
