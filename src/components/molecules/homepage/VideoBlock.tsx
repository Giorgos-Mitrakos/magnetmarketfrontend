'use client'
// Βίντεο YouTube που φορτώνει ΜΟΝΟ όταν ο πελάτης πατήσει play.
// Μέχρι τότε: μια εικόνα (δική μας ή η μικρογραφία του YouTube) με κουμπί play —
// κανένα script/cookie του YouTube στη φόρτωση της σελίδας.
// Χρησιμοποιεί το youtube-nocookie.com (λειτουργία αυξημένου απορρήτου).
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getStrapiMedia } from '@/repositories/medias'
import { IVideoBlock } from '@/lib/queries/homepage'
import { FaPlay, FaArrowRight } from 'react-icons/fa6'

export default function VideoBlock({ id, block }: { id: string; block: IVideoBlock }) {
  const [playing, setPlaying] = useState(false)
  const label = block.title || 'Βίντεο'
  const poster = block.poster?.url ? getStrapiMedia(block.poster.url) : null
  const ytThumb = `https://i.ytimg.com/vi/${block.youtube_id}/hqdefault.jpg`
  const sideBySide = block.layout !== 'full'
  const hasText = !!(block.title || block.text || block.href)

  const player = (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${block.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Αναπαραγωγή βίντεο: ${label}`}
        >
          {poster ? (
            <Image src={poster} alt="" fill sizes={sideBySide ? '(max-width: 768px) 100vw, 50vw' : '100vw'} className="object-cover" />
          ) : (
            // Μικρογραφία του YouTube (απλό <img>: δεν χρειάζεται ρύθμιση domain στο next.config)
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ytThumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition group-hover:scale-110 md:h-20 md:w-20">
            <FaPlay className="ml-1 h-6 w-6 md:h-8 md:w-8" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  )

  const text = hasText && (
    <div className={sideBySide ? 'flex flex-col justify-center gap-3' : 'mb-4 text-center'}>
      {block.title && (
        <h2 className="text-2xl font-bold text-siteColors-purple dark:text-slate-200 md:text-3xl">{block.title}</h2>
      )}
      {block.text && (
        <p className={`whitespace-pre-line text-gray-700 dark:text-gray-300 ${sideBySide ? '' : 'mx-auto max-w-3xl'}`}>
          {block.text}
        </p>
      )}
      {block.href && (
        <Link
          href={block.href}
          target={block.open_in_new_tab ? '_blank' : undefined}
          className={`inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink px-5 py-2.5 font-semibold text-white shadow hover:opacity-90 ${sideBySide ? '' : 'mx-auto mt-2'}`}
        >
          {block.link_label || 'Δείτε περισσότερα'} <FaArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )

  if (!sideBySide) {
    return (
      <section id={id} aria-label={label}>
        {text}
        <div className="mx-auto max-w-5xl">{player}</div>
      </section>
    )
  }

  return (
    <section id={id} aria-label={label} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
      <div className={block.layout === 'video_right' ? 'md:order-2' : ''}>{player}</div>
      {text}
    </section>
  )
}
