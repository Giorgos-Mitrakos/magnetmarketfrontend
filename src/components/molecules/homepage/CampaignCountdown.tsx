'use client'
// Καμπάνια με αντίστροφη μέτρηση (π.χ. «Black Friday σε 3 μέρες»).
// Δύο φάσεις: πριν την «Έναρξη» μετράει μέχρι την έναρξη (κείμενα «πριν»),
// μετά μέχρι τη «Λήξη». Όταν λήξει, το block εξαφανίζεται χωρίς ανανέωση σελίδας.
// Με εικόνα: τα κείμενα πάνω στην εικόνα · χωρίς εικόνα: χρωματιστό πλαίσιο.
import { useState } from 'react'
import { TrackableLink } from '@/components/atoms/TrackableLink'
import CountdownBoxes from '@/components/atoms/CountdownBoxes'
import { ICampaignCountdownBlock } from '@/lib/queries/homepage'
import ResponsiveImage from './responsiveImage'
import { blockBg } from './blockColors'
import { FaArrowRight } from 'react-icons/fa6'

export default function CampaignCountdown({
  id,
  block,
  priority = false,
}: {
  id: string
  block: ICampaignCountdownBlock
  priority?: boolean
}) {
  const [phase, setPhase] = useState<'before' | 'live' | 'ended'>(block.starts_at ? 'before' : 'live')
  if (phase === 'ended') return null

  const before = phase === 'before'
  const title = before ? block.title_before : block.title
  const subtitle = before ? block.subtitle_before : block.subtitle
  const target = before ? block.starts_at! : block.ends_at
  const label = before ? 'Ξεκινά σε' : 'Λήγει σε'

  const content = (
    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
      <div className="max-w-xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-base text-white/90 md:text-lg">{subtitle}</p>}
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-wider text-white/80">{label}</span>
        <CountdownBoxes
          key={target}
          target={target}
          onEnd={() => setPhase(before ? 'live' : 'ended')}
        />
        {block.href && !before && (
          <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 shadow transition group-hover:scale-105">
            {block.link_label || 'Δείτε τις προσφορές'} <FaArrowRight aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )

  const inner = block.image ? (
    <div className="relative overflow-hidden rounded-xl shadow-lg">
      <ResponsiveImage
        image={block.image}
        mobileImage={block.mobile_image}
        alt={block.image.alternativeText || title}
        sizes="100vw"
        priority={priority}
        className="min-h-[260px] object-cover"
      />
      <div className="absolute inset-0 flex items-center bg-gradient-to-t from-black/70 via-black/40 to-black/20 p-5 md:bg-gradient-to-r md:p-10">
        <div className="w-full">{content}</div>
      </div>
    </div>
  ) : (
    <div className={`rounded-xl px-5 py-8 shadow-lg md:px-10 md:py-10 ${blockBg(block.color)}`}>{content}</div>
  )

  // Πριν την έναρξη δεν οδηγούμε πουθενά (δεν υπάρχουν ακόμη προσφορές)
  if (!block.href || before) {
    return (
      <section id={id} aria-label={title}>
        {inner}
      </section>
    )
  }

  return (
    <section id={id} aria-label={title}>
      <TrackableLink
        href={block.href}
        target={block.open_in_new_tab ? '_blank' : undefined}
        className="group block"
        bannerId={`campaign_${id}_${block.id}`}
        bannerName={block.title}
        bannerPosition={`homepage_${id}`}
        bannerType="campaign"
      >
        {inner}
      </TrackableLink>
    </section>
  )
}
