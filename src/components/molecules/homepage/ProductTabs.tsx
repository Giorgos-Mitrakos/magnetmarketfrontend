'use client'
// Λίστα προϊόντων με καρτέλες (π.χ. Προσφορές | Νέα | Αναμένονται).
// Η πρώτη καρτέλα αποδίδεται στον server (έτοιμη στο HTML)· οι υπόλοιπες
// ζωγραφίζονται μόνο όταν τις πατήσει ο πελάτης (και οι εικόνες τους φορτώνουν τότε).
import { useId, useState, KeyboardEvent } from 'react'
import Carousel from '@/components/atoms/carousel'
import ViewListTracker from '@/components/atoms/ViewListTracker'
import SaleCountdown from '@/components/atoms/SaleCountdown'
import { IProductTabsBlock } from '@/lib/queries/homepage'
import { blockBg } from './blockColors'

export default function ProductTabs({ id, block }: { id: string; block: IProductTabsBlock }) {
  const [active, setActive] = useState(0)
  const uid = useId()
  const tabs = block.tabs ?? []
  if (!tabs.length) return null
  const tab = tabs[Math.min(active, tabs.length - 1)]
  const listId = `homepage_tabs_${id}_${tab.id}`
  const endsAt = tab.source === 'sale_ending' ? tab.ends_at : null

  // Βελάκια αριστερά/δεξιά ανάμεσα στις καρτέλες (προσβασιμότητα)
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    setActive(next)
    document.getElementById(`${uid}-tab-${next}`)?.focus()
  }

  return (
    <section id={id} className="my-8" aria-label={block.title ?? tabs.map((t) => t.label).join(' / ')}>
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg dark:border-slate-700">
        <div className={`px-4 py-4 text-white md:px-6 ${blockBg(block.color)}`}>
          {block.title && <h2 className="text-center text-xl font-bold md:text-2xl">{block.title}</h2>}
          {block.subtitle && <p className="mt-1 text-center text-white/85">{block.subtitle}</p>}

          <div
            role="tablist"
            aria-label={block.title ?? 'Λίστες προϊόντων'}
            className={`flex justify-start gap-2 overflow-x-auto pb-1 md:justify-center ${block.title ? 'mt-3' : ''}`}
          >
            {tabs.map((t, i) => {
              const selected = i === active
              return (
                <button
                  key={t.id}
                  id={`${uid}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={onKey}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition md:text-base ${
                    selected ? 'bg-white text-slate-900 shadow' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          {endsAt && (
            <div className="mt-3 text-center">
              <SaleCountdown endsAt={endsAt} variant="header" label="Η πρώτη λήγει σε" />
            </div>
          )}
        </div>

        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${active}`}
          className="bg-white px-2 py-2 dark:bg-slate-800 sm:px-4"
        >
          <ViewListTracker key={listId} products={tab.products} listName={tab.label} listId={listId}>
            <Carousel key={listId} products={tab.products} listName={tab.label} listId={listId} />
          </ViewListTracker>
        </div>
      </div>
    </section>
  )
}
