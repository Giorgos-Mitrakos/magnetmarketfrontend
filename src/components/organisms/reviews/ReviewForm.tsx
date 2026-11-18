'use client'
/**
 * (2026-10-23) Σελίδα αξιολόγησης από τον σύνδεσμο του email (#23): /review/{token}
 * ?optout=1 → «δεν θέλω άλλες προσκλήσεις αξιολόγησης».
 */
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getStrapiMedia } from '@/repositories/medias'

type Invite = {
  status: 'invited' | 'pending' | 'approved' | 'rejected' | 'expired'
  editable: boolean
  product: { name: string; slug: string | null; image: { url: string; formats?: any } | null }
  orderNumber: string | null
  publicName: string | null
  rating: number | null
  title: string | null
  body: string | null
  /** (2026-10-24) Σύνδεσμος κριτικής Google Business Profile (ή null) */
  googleReviewUrl?: string | null
}

/** Πρόσκληση για κριτική στη Google — ίδια για όλους, ανεξάρτητα από τα αστέρια */
function GoogleReviewCta({ url }: { url?: string | null }) {
  if (!url) return null
  return (
    <div className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-600">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        Θα μας αφήνατε και μια σύντομη κριτική στη Google για την εξυπηρέτησή μας; Βοηθά πολύ ένα μικρό κατάστημα σαν το δικό μας.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-siteColors-purple px-4 py-2 text-sm font-semibold text-siteColors-purple transition hover:bg-siteColors-purple hover:text-white dark:border-slate-300 dark:text-slate-100"
      >
        Κριτική στη Google ↗
      </a>
    </div>
  )
}

const LABELS = ['', 'Κακό', 'Μέτριο', 'Καλό', 'Πολύ καλό', 'Εξαιρετικό']

export default function ReviewForm({ token, optout }: { token: string; optout: boolean }) {
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)
  const [optoutDone, setOptoutDone] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/reviews/invite/${encodeURIComponent(token)}`)
      .then(async r => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.error || 'Ο σύνδεσμος δεν είναι έγκυρος.')
        const d: Invite = j.data
        setInvite(d)
        setRating(d.rating ?? 0)
        setTitle(d.title ?? '')
        setBody(d.body ?? '')
        setName(d.publicName ?? '')
        setGoogleUrl(d.googleReviewUrl ?? null)
      })
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Ο σύνδεσμος δεν είναι έγκυρος.'))
  }, [token])

  const doOptout = async () => {
    const r = await fetch('/api/reviews/optout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
    const j = await r.json().catch(() => ({}))
    setOptoutDone(r.ok ? j?.data?.message || 'Έγινε.' : j?.error || 'Δεν ήταν δυνατό — δοκιμάστε ξανά.')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) {
      setError('Διαλέξτε πόσα αστέρια δίνετε.')
      return
    }
    setSending(true)
    setError(null)
    try {
      const r = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, title, body, name, website }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error || 'Δεν ήταν δυνατή η αποστολή.')
      setDone(j?.data?.message || 'Ευχαριστούμε!')
      if (j?.data?.googleReviewUrl) setGoogleUrl(j.data.googleReviewUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Δεν ήταν δυνατή η αποστολή.')
    } finally {
      setSending(false)
    }
  }

  const card = 'mx-auto my-8 max-w-2xl rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800'

  if (loadError) {
    return (
      <div className={card}>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Αξιολόγηση προϊόντος</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{loadError}</p>
        <Link href="/" className="mt-4 inline-block text-siteColors-purple underline">Στην αρχική</Link>
      </div>
    )
  }
  if (!invite) return <div className={card}><p className="text-slate-600 dark:text-slate-300">Φόρτωση…</p></div>

  const img = getStrapiMedia(invite.product.image?.formats?.thumbnail?.url || invite.product.image?.url)
  const header = (
    <div className="flex items-center gap-4">
      {img && (
        <span className="relative block h-20 w-20 shrink-0">
          <Image src={img} alt={invite.product.name} fill sizes="80px" className="object-contain" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">Αξιολόγηση{invite.orderNumber ? ` · παραγγελία #${invite.orderNumber}` : ''}</p>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{invite.product.name}</h1>
      </div>
    </div>
  )

  if (optout) {
    return (
      <div className={card}>
        {header}
        <div className="mt-6">
          {optoutDone ? (
            <p className="text-slate-700 dark:text-slate-200" role="status">{optoutDone}</p>
          ) : (
            <>
              <p className="text-slate-700 dark:text-slate-200">Να μη σας ξαναστείλουμε προσκλήσεις αξιολόγησης για τις επόμενες αγορές σας;</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={doOptout} className="rounded-lg bg-siteColors-purple px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">Ναι, χωρίς προσκλήσεις</button>
                <Link href={`/review/${encodeURIComponent(token)}`} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Όχι, θέλω να αξιολογήσω</Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (done || !invite.editable) {
    const msg = done
      ?? (invite.status === 'expired' ? 'Ο σύνδεσμος αξιολόγησης έληξε.' : invite.status === 'approved' ? 'Η αξιολόγησή σας έχει δημοσιευτεί — ευχαριστούμε!' : 'Η αξιολόγησή σας έχει ήδη καταχωριστεί — ευχαριστούμε!')
    return (
      <div className={card}>
        {header}
        <p className="mt-6 text-slate-700 dark:text-slate-200" role="status">{msg}</p>
        {invite.status !== 'expired' && <GoogleReviewCta url={googleUrl} />}
        {invite.product.slug && <Link href={`/product/${invite.product.slug}`} className="mt-4 inline-block text-siteColors-purple underline">Στη σελίδα του προϊόντος</Link>}
      </div>
    )
  }

  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-siteColors-purple focus:outline-none focus:ring-1 focus:ring-siteColors-purple dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
  const shown = hover || rating

  return (
    <div className={card}>
      {header}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Πόσο σας άρεσε;</legend>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`${n} ${n === 1 ? 'αστέρι' : 'αστέρια'} — ${LABELS[n]}`}
                aria-pressed={rating === n}
                className="p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-siteColors-purple"
              >
                <svg viewBox="0 0 20 20" className={`h-9 w-9 ${n <= shown ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" aria-hidden>
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">{LABELS[shown]}</span>
          </div>
        </fieldset>
        <div>
          <label htmlFor="rv-title" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Τίτλος <span className="font-normal text-slate-500">(προαιρετικό)</span></label>
          <input id="rv-title" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className={input} placeholder="π.χ. Πολύ καλή σχέση ποιότητας-τιμής" />
        </div>
        <div>
          <label htmlFor="rv-body" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Η γνώμη σας <span className="font-normal text-slate-500">(προαιρετικό)</span></label>
          <textarea id="rv-body" rows={5} maxLength={3000} value={body} onChange={e => setBody(e.target.value)} className={input} placeholder="Τι σας άρεσε, τι όχι, για ποια χρήση το πήρατε…" />
        </div>
        <div className="max-w-xs">
          <label htmlFor="rv-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Όνομα που θα εμφανίζεται</label>
          <input id="rv-name" maxLength={60} value={name} onChange={e => setName(e.target.value)} className={input} />
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} className="hidden" aria-hidden />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Η αξιολόγηση εμφανίζεται στη σελίδα του προϊόντος με την ένδειξη «Επαληθευμένη αγορά», μετά από έλεγχο. Δεν δημοσιεύουμε email ή τηλέφωνο.
        </p>
        {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        <button type="submit" disabled={sending} className="rounded-lg bg-siteColors-purple px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {sending ? 'Αποστολή…' : invite.status === 'pending' ? 'Αποθήκευση αλλαγών' : 'Αποστολή αξιολόγησης'}
        </button>
      </form>
    </div>
  )
}
