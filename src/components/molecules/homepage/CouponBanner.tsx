'use client'
// Κουπόνι: λωρίδα με τον κωδικό και κουμπί «Αντιγραφή».
// Έκπτωση, όροι και λήξη έρχονται έτοιμα από το backend (από το ίδιο το κουπόνι)·
// αν το κουπόνι λήξει / εξαντληθεί / απενεργοποιηθεί, το block δεν έρχεται καθόλου.
import { useState } from 'react'
import Link from 'next/link'
import { ICouponBannerBlock } from '@/lib/queries/homepage'
import { blockBg } from './blockColors'
import { FaRegCopy, FaCheck, FaTicket, FaArrowRight } from 'react-icons/fa6'

export default function CouponBanner({ id, block }: { id: string; block: ICouponBannerBlock }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code)
    } catch {
      // Παλιοί browsers / χωρίς άδεια: επιλογή του κειμένου για χειροκίνητη αντιγραφή
      const el = document.getElementById(`${id}-code`)
      const range = document.createRange()
      if (el) {
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section id={id} aria-label={block.title} className={`overflow-hidden rounded-xl shadow-lg ${blockBg(block.color)}`}>
      <div className="flex flex-col items-center gap-5 px-5 py-6 text-center text-white md:flex-row md:justify-between md:px-10 md:text-left">
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-5">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
            <FaTicket className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold md:text-2xl">{block.title}</h2>
            {block.text && <p className="mt-1 text-white/90">{block.text}</p>}
            {block.conditions.length > 0 && (
              <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-white/80 md:justify-start">
                {block.conditions.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/75">Κωδικός κουπονιού</span>
          <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-dashed border-white/70 bg-white/10">
            <span id={`${id}-code`} className="select-all px-4 py-2 font-mono text-xl font-bold tracking-widest md:text-2xl">
              {block.code}
            </span>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-2 bg-white px-4 text-sm font-bold text-slate-900 transition hover:bg-white/90"
              aria-label={`Αντιγραφή του κωδικού ${block.code}`}
            >
              {copied ? <FaCheck className="text-green-600" aria-hidden="true" /> : <FaRegCopy aria-hidden="true" />}
              {copied ? 'Αντιγράφηκε!' : 'Αντιγραφή'}
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Ο κωδικός αντιγράφηκε' : ''}
          </span>
          {block.href && (
            <Link
              href={block.href}
              target={block.open_in_new_tab ? '_blank' : undefined}
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {block.link_label || 'Ξεκινήστε τις αγορές'} <FaArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
