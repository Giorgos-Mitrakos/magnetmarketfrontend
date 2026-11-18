'use client'
/**
 * (2026-10-24) Κατασκευαστές: αναζήτηση + ευρετήριο Α–Ω, λογότυπο ή όνομα,
 * όνομα και πλήθος προϊόντων πάντα ορατά (και στο κινητό).
 */
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getStrapiMedia } from '@/repositories/medias'
import type { IBrands } from '@/lib/interfaces/brands'

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('el-GR')

/** Πρώτο γράμμα για το ευρετήριο: Α–Ω / A–Z, αλλιώς «0-9» */
function letterOf(name: string): string {
  const c = strip(name).charAt(0).toLocaleUpperCase('el-GR')
  return /[A-ZΑ-Ω]/.test(c) ? c : '0-9'
}

export default function BrandsDirectory({ brands }: { brands: IBrands[] }) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<string | null>(null)

  const letters = useMemo(() => {
    const set = new Set(brands.map((b) => letterOf(b.name)))
    return Array.from(set).sort((a, b) => (a === '0-9' ? -1 : b === '0-9' ? 1 : a.localeCompare(b, 'el')))
  }, [brands])

  const visible = useMemo(() => {
    const q = strip(query.trim())
    return brands.filter((b) => (!q || strip(b.name).includes(q)) && (!letter || letterOf(b.name) === letter))
  }, [brands, query, letter])

  const chip = (active: boolean) =>
    `min-w-[2.25rem] rounded-md px-2 py-1 text-sm font-semibold transition ${active ? 'bg-siteColors-purple text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}`

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setLetter(null)
          }}
          placeholder="Αναζήτηση κατασκευαστή…"
          aria-label="Αναζήτηση κατασκευαστή"
          className="mx-auto w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:border-siteColors-purple focus:outline-none focus:ring-1 focus:ring-siteColors-purple dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <nav aria-label="Ευρετήριο κατασκευαστών" className="flex flex-wrap justify-center gap-1.5">
          <button type="button" onClick={() => setLetter(null)} aria-pressed={!letter} className={chip(!letter)}>
            Όλοι
          </button>
          {letters.map((l) => (
            <button key={l} type="button" onClick={() => setLetter(l === letter ? null : l)} aria-pressed={letter === l} className={chip(letter === l)}>
              {l}
            </button>
          ))}
        </nav>
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-gray-500 dark:text-gray-400">Κανένας κατασκευαστής με «{query}».</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-label="Κατασκευαστές">
          {visible.map((brand) => {
            const logo = brand.logo?.url ? getStrapiMedia(brand.logo.formats?.small?.url || brand.logo.url) : null
            return (
              <li key={brand.id}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group flex h-full flex-col items-center rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-siteColors-purple dark:border-slate-600 dark:bg-slate-700"
                >
                  <span className="relative flex h-16 w-full items-center justify-center">
                    {logo ? (
                      <Image src={logo} alt={brand.logo?.alternativeText || `Λογότυπο ${brand.name}`} fill sizes="160px" className="object-contain" />
                    ) : (
                      <span className="line-clamp-2 text-lg font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">{brand.name}</span>
                    )}
                  </span>
                  <span className="mt-3 line-clamp-1 text-sm font-semibold text-slate-800 group-hover:text-siteColors-purple dark:text-slate-100">{brand.name}</span>
                  {brand.productCount ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {brand.productCount} {brand.productCount === 1 ? 'προϊόν' : 'προϊόντα'}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
