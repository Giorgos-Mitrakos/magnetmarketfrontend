'use client'
/**
 * (2026-10-23) Video προϊόντος (YouTube / Vimeo, από τον Product Manager).
 * Μέχρι να πατηθεί «play» δείχνουμε μόνο τη μικρογραφία: κανένα iframe, κανένα
 * cookie, καμία καθυστέρηση στη σελίδα. Μετά φορτώνει το youtube-nocookie / Vimeo.
 * Διακόπτης: Product Manager → Ρυθμίσεις → Λειτουργίες σελίδας προϊόντος.
 */
import { useState } from 'react'
import { FaPlay } from 'react-icons/fa6'
import type { IProductVideo } from '@/lib/interfaces/product'

function VideoCard({ video, productName, index }: { video: IProductVideo; productName: string; index: number }) {
  const [playing, setPlaying] = useState(false)
  const title = video.title || (index ? `Video προϊόντος ${index + 1}` : 'Video προϊόντος')

  return (
    <figure className="min-w-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
        {playing ? (
          <iframe
            src={video.embedUrl}
            title={`${title} — ${productName}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
            aria-label={`Αναπαραγωγή: ${title}`}
          >
            {video.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnail}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
              />
            )}
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-siteColors-purple/90 text-white shadow-lg transition group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-white">
              <FaPlay className="ml-1 h-5 w-5" aria-hidden />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="truncate">{title}</span>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="shrink-0 text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
        >
          {video.provider === 'youtube' ? 'Στο YouTube ↗' : 'Στο Vimeo ↗'}
        </a>
      </figcaption>
    </figure>
  )
}

export default function ProductVideos({ videos, productName }: { videos: IProductVideo[]; productName: string }) {
  if (!videos.length) return null
  return (
    <section id="videos" aria-labelledby="product-videos-title" className="scroll-mt-24 rounded-xl bg-white p-6 dark:bg-gray-800">
      <h2 id="product-videos-title" className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Video
      </h2>
      <div className={videos.length === 1 ? 'max-w-3xl' : 'grid gap-6 sm:grid-cols-2'}>
        {videos.map((v, i) => (
          <VideoCard key={v.provider + v.id} video={v} productName={productName} index={i} />
        ))}
      </div>
    </section>
  )
}
