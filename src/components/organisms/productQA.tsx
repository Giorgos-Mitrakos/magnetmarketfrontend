'use client'
/**
 * (2026-10-23) «Ερωτήσεις & απαντήσεις» στη σελίδα προϊόντος.
 * Λίστα: ερωτήσεις που δημοσίευσε ο διαχειριστής (με συγκατάθεση του πελάτη) —
 * μόνο ερώτηση, απάντηση και όνομα τύπου «Γιώργος Μ.».
 * Φόρμα: νέα ερώτηση → «Αιτήματα πελατών» στο Strapi· η απάντηση πάει στο email.
 * Διακόπτης: Product Manager → Ρυθμίσεις → «Δημόσιες ερωτήσεις» — κλειστός: μένει
 * μόνο η φόρμα ερώτησης (χωρίς λίστα και χωρίς επιλογή δημοσίευσης).
 * (2026-10-24) Εμφανίζεται ως καρτέλα «Ερωτήσεις» στο ProductInfo.
 */
import { useState } from 'react'
import { FaRegCircleQuestion, FaChevronDown } from 'react-icons/fa6'
import type { IProductQa } from '@/lib/interfaces/product'

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const SHOW = 5

function QuestionForm({ productDocumentId, productId, onDone, publicEnabled, cancellable }: { productDocumentId?: string; productId: number; onDone: () => void; publicEnabled: boolean; cancellable: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', allowPublic: publicEnabled, website: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  const set = (k: keyof typeof form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/product-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, allowPublic: publicEnabled && form.allowPublic, productDocumentId, productId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Δεν ήταν δυνατή η αποστολή — δοκιμάστε ξανά.')
      setSent(json?.data?.message || 'Λάβαμε την ερώτησή σας! Θα σας απαντήσουμε σύντομα στο email σας.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Δεν ήταν δυνατή η αποστολή — δοκιμάστε ξανά.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100" role="status">
        <p className="font-semibold">{sent}</p>
        {publicEnabled && form.allowPublic && <p className="mt-1">Αν η ερώτηση βοηθά και άλλους, μπορεί να εμφανιστεί εδώ μαζί με την απάντηση — μόνο με το μικρό σας όνομα.</p>}
        {cancellable && <button type="button" onClick={onDone} className="mt-3 text-sm font-medium underline underline-offset-2">Κλείσιμο</button>}
      </div>
    )
  }

  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-siteColors-purple focus:outline-none focus:ring-1 focus:ring-siteColors-purple dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-600">
      <div>
        <label htmlFor="qa-message" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Η ερώτησή σας</label>
        <textarea id="qa-message" required minLength={5} maxLength={3000} rows={3} value={form.message} onChange={e => set('message', e.target.value)} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="qa-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Ονοματεπώνυμο</label>
          <input id="qa-name" required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="qa-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email (για την απάντηση)</label>
          <input id="qa-email" type="email" required autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="qa-phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Τηλέφωνο <span className="font-normal text-slate-500">(προαιρετικό)</span></label>
          <input id="qa-phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={input} />
        </div>
      </div>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => set('website', e.target.value)} className="hidden" aria-hidden />
      {publicEnabled && (
        <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={form.allowPublic} onChange={e => set('allowPublic', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
          <span>Η ερώτηση και η απάντηση μπορούν να δημοσιευτούν σε αυτή τη σελίδα (μόνο με το μικρό μου όνομα — ποτέ email ή τηλέφωνο).</span>
        </label>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={sending} className="rounded-lg bg-siteColors-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {sending ? 'Αποστολή…' : 'Αποστολή ερώτησης'}
        </button>
        {cancellable && (
          <button type="button" onClick={onDone} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Άκυρο</button>
        )}
      </div>
    </form>
  )
}

export default function ProductQA({
  qa,
  productId,
  productDocumentId,
  publicEnabled = true,
}: {
  qa: IProductQa[]
  productId: number
  productDocumentId?: string
  /** (2026-10-24) Διακόπτης «Δημόσιες ερωτήσεις»: κλειστός → μόνο η φόρμα ερώτησης, χωρίς λίστα/δημοσίευση */
  publicEnabled?: boolean
}) {
  const [showAll, setShowAll] = useState(false)
  const [asking, setAsking] = useState(false)
  const visible = showAll ? qa : qa.slice(0, SHOW)

  // Μόνο φόρμα: η ερώτηση πάει στα «Αιτήματα πελατών», η απάντηση στο email
  if (!publicEnabled) {
    return (
      <div id="questions" className="scroll-mt-24">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Έχετε απορία για το προϊόν; Ρωτήστε μας — θα σας απαντήσουμε στο email σας, συνήθως μέσα στην ίδια εργάσιμη.
        </p>
        <QuestionForm productId={productId} productDocumentId={productDocumentId} onDone={() => {}} publicEnabled={false} cancellable={false} />
      </div>
    )
  }

  // Μέσα στις καρτέλες της σελίδας (ProductInfo) — χωρίς δικό της πλαίσιο/τίτλο
  return (
    <div id="questions" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {qa.length ? `${qa.length} ${qa.length === 1 ? 'ερώτηση' : 'ερωτήσεις'} με απάντηση από εμάς` : 'Έχετε απορία για το προϊόν; Ρωτήστε μας — απαντάμε συνήθως μέσα στην ίδια εργάσιμη.'}
        </p>
        {!asking && (
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-siteColors-purple px-4 py-2 text-sm font-semibold text-siteColors-purple transition hover:bg-siteColors-purple hover:text-white dark:border-slate-300 dark:text-slate-100"
          >
            <FaRegCircleQuestion aria-hidden /> Κάντε μια ερώτηση
          </button>
        )}
      </div>

      {asking && (
        <div className="mb-5">
          <QuestionForm productId={productId} productDocumentId={productDocumentId} onDone={() => setAsking(false)} publicEnabled cancellable />
        </div>
      )}

      {qa.length === 0 ? null : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {visible.map(item => (
            <li key={item.id} className="py-4 first:pt-0">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                <span className="mr-1 font-bold text-siteColors-purple dark:text-slate-300" aria-hidden>Ε:</span>
                {item.question}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {item.name} · {fmtDate(item.askedAt)}
              </p>
              <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-700/40 dark:text-slate-200">
                <p className="whitespace-pre-line">
                  <span className="mr-1 font-bold text-emerald-700 dark:text-emerald-300" aria-hidden>Α:</span>
                  {item.answer}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Magnet Market{item.answeredAt ? ` · ${fmtDate(item.answeredAt)}` : ''}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {qa.length > SHOW && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-siteColors-purple underline-offset-2 hover:underline dark:text-slate-200"
          aria-expanded={showAll}
        >
          {showAll ? 'Λιγότερες' : `Όλες οι ερωτήσεις (${qa.length})`}
          <FaChevronDown className={`h-3 w-3 transition ${showAll ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      )}
    </div>
  )
}
