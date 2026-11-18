// Προσφορά της ημέρας: ένα προϊόν σε μεγάλη κάρτα.
// Server component — μόνο η αντίστροφη μέτρηση τρέχει στον browser.
// Η αντίστροφη μέτρηση εμφανίζεται μόνο αν η προσφορά έχει πραγματική «Λήξη»
// και το «Τελευταία τεμάχια» μόνο με πραγματικό απόθεμα αποθήκης.
import Image from 'next/image'
import { TrackableLink } from '@/components/atoms/TrackableLink'
import CountdownBoxes from '@/components/atoms/CountdownBoxes'
import { getStrapiMedia } from '@/repositories/medias'
import { IDealOfDayBlock } from '@/lib/queries/homepage'
import { blockBg, eur } from './blockColors'
import { FaArrowRight, FaBolt, FaBoxOpen } from 'react-icons/fa6'

export default function DealOfDay({ id, block }: { id: string; block: IDealOfDayBlock }) {
  const p = block.product
  if (!p) return null
  const href = `/product/${p.slug}`
  const img = p.image?.url ? getStrapiMedia(p.image.url) : null
  const savings = p.price && p.sale_price ? p.price - p.sale_price : 0

  return (
    <section id={id} aria-label={block.title} className={`overflow-hidden rounded-xl shadow-lg ${blockBg(block.color)}`}>
      <div className="flex items-center justify-center gap-2 px-4 pt-5 text-white md:justify-start md:px-8">
        <FaBolt className="text-yellow-300" aria-hidden="true" />
        <h2 className="text-xl font-extrabold tracking-tight md:text-3xl">{block.title}</h2>
      </div>

      <div className="grid gap-6 p-4 md:grid-cols-2 md:items-center md:p-8">
        {/* Εικόνα */}
        <TrackableLink
          href={href}
          className="relative block aspect-square w-full max-w-md justify-self-center overflow-hidden rounded-xl bg-white"
          bannerId={`deal_${id}_${p.documentId ?? p.id}`}
          bannerName={p.name}
          bannerPosition={`homepage_${id}`}
          bannerType="deal"
        >
          {img && (
            <Image
              src={img}
              alt={p.image?.alternativeText || p.name}
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-contain p-6"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-lg font-extrabold text-white shadow">
            -{block.discount_percent}%
          </span>
        </TrackableLink>

        {/* Στοιχεία */}
        <div className="flex flex-col items-center gap-4 text-center text-white md:items-start md:text-left">
          {p.brand?.name && <span className="text-sm font-semibold uppercase tracking-wider text-white/75">{p.brand.name}</span>}
          <h3 className="text-xl font-bold leading-snug md:text-2xl">
            <TrackableLink
              href={href}
              className="hover:underline"
              bannerId={`deal_title_${id}`}
              bannerName={p.name}
              bannerPosition={`homepage_${id}`}
              bannerType="deal"
            >
              {p.name}
            </TrackableLink>
          </h3>

          <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 md:justify-start">
            <span className="text-3xl font-extrabold md:text-4xl">{eur(p.sale_price)}</span>
            <span className="text-lg text-white/70 line-through">{eur(p.price)}</span>
            {savings > 0 && (
              <span className="rounded-md bg-yellow-300 px-2 py-0.5 text-sm font-bold text-slate-900">
                Κερδίζετε {eur(savings)}
              </span>
            )}
          </div>

          {p.sale_ends_at && (
            <div className="flex flex-col items-center gap-2 md:items-start">
              <span className="text-sm font-semibold text-white/80">Η προσφορά λήγει σε</span>
              <CountdownBoxes target={p.sale_ends_at} size="md" />
            </div>
          )}

          {block.low_stock != null && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold">
              <FaBoxOpen aria-hidden="true" />
              {block.low_stock === 1 ? 'Τελευταίο τεμάχιο σε απόθεμα!' : `Μόνο ${block.low_stock} τεμάχια σε απόθεμα`}
            </p>
          )}

          <TrackableLink
            href={href}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-slate-900 shadow transition hover:scale-105"
            bannerId={`deal_cta_${id}`}
            bannerName={p.name}
            bannerPosition={`homepage_${id}`}
            bannerType="deal"
          >
            Δείτε την προσφορά <FaArrowRight aria-hidden="true" />
          </TrackableLink>
        </div>
      </div>
    </section>
  )
}
