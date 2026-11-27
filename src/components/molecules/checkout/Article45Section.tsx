'use client'
// (2026-11-26) Απαλλαγή ΦΠΑ άρθρου 45 (πρώην 39α) στο ταμείο.
//  - Εμφανίζεται μόνο με τιμολόγιο + έγκυρο Α.Φ.Μ.
//  - Με την επιλογή: έλεγχος στην ΑΑΔΕ (καθεστώς ΦΠΑ) + ποια προϊόντα του καλαθιού υπάγονται.
//    Αν η ΑΑΔΕ πει ρητά «όχι» ή κανένα προϊόν δεν υπάγεται, η επιλογή δεν κρατιέται.
//  - Στοιχεία εκπροσώπου: ΠΡΟΑΙΡΕΤΙΚΑ (αν λείπουν, η ταυτοποίηση γίνεται από το κατάστημα).
//  - Όλα είναι ενημερωτικά: η απαλλαγή εφαρμόζεται από το Strapi, που ξαναελέγχει στην ΑΑΔΕ.
import { useEffect, useState } from 'react'
import { useCheckout } from '@/context/checkout'
import { AADE_IDENTITY_TYPES } from '@/lib/helpers/aadeIdentityTypes'

type ProductsInfo = {
    eligible: { documentId: string; name: string }[]
    ineligible: { documentId: string; name: string }[]
    warning: string | null
}

type Status =
    | { kind: 'idle' }
    | { kind: 'checking' }
    | { kind: 'ok'; products: ProductsInfo | null }
    | { kind: 'unverified'; text: string }
    | { kind: 'rejected'; text: string }

type ReprStatus =
    | { kind: 'idle' }
    | { kind: 'checking' }
    | { kind: 'verified'; otpRequired: boolean }
    | { kind: 'failed'; text: string }

const inputClass =
    'block w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-600 dark:text-slate-200'

export default function Article45Section({ afm }: { afm: string }) {
    const { checkout, dispatch } = useCheckout()
    const a45 = checkout.article45
    const requested = !!a45?.requested && a45.afm === afm
    const [status, setStatus] = useState<Status>({ kind: 'idle' })
    const [repr, setRepr] = useState<ReprStatus>({ kind: 'idle' })

    // Άλλαξε το ΑΦΜ → η επιλογή ακυρώνεται (ο έλεγχος αφορούσε άλλο ΑΦΜ)
    useEffect(() => {
        if (a45?.requested && a45.afm !== afm) {
            dispatch({ type: 'SET_ARTICLE_45', payload: null })
            setStatus({ kind: 'idle' })
            setRepr({ kind: 'idle' })
        }
    }, [afm, a45?.requested, a45?.afm, dispatch])

    const productIds = checkout.cart.map((i) => i.documentId).filter((id): id is string => !!id)

    const check = async (extra?: Record<string, unknown>) => {
        const res = await fetch('/api/storefront/article-45-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ afm, productDocumentIds: productIds, ...extra }),
        })
        const data = await res.json().catch(() => ({}))
        return { ok: res.ok && data?.ok !== false, data }
    }

    const toggle = async (on: boolean) => {
        setRepr({ kind: 'idle' })
        if (!on) {
            dispatch({ type: 'SET_ARTICLE_45', payload: null })
            setStatus({ kind: 'idle' })
            return
        }
        setStatus({ kind: 'checking' })
        try {
            const { ok, data } = await check()
            if (!ok) {
                // Η ΑΑΔΕ δεν απάντησε: η επιλογή κρατιέται — ο έλεγχος θα γίνει στην ολοκλήρωση
                dispatch({ type: 'SET_ARTICLE_45', payload: { requested: true, afm } })
                setStatus({
                    kind: 'unverified',
                    text: `${data?.message || 'Η ΑΑΔΕ δεν απαντά αυτή τη στιγμή.'} Ο έλεγχος θα γίνει κατά την ολοκλήρωση της παραγγελίας.`,
                })
                return
            }
            if (data.eligible === false) {
                dispatch({ type: 'SET_ARTICLE_45', payload: null })
                setStatus({
                    kind: 'rejected',
                    text: 'Σύμφωνα με την ΑΑΔΕ, το Α.Φ.Μ. δεν είναι σε κανονικό καθεστώς ΦΠΑ — η απαλλαγή δεν μπορεί να εφαρμοστεί.',
                })
                return
            }
            const products: ProductsInfo | null = data.products ?? null
            if (products && products.eligible.length === 0) {
                dispatch({ type: 'SET_ARTICLE_45', payload: null })
                setStatus({
                    kind: 'rejected',
                    text: 'Κανένα προϊόν του καλαθιού δεν υπάγεται στην απαλλαγή του άρθρου 45.',
                })
                return
            }
            dispatch({ type: 'SET_ARTICLE_45', payload: { requested: true, afm } })
            setStatus({ kind: 'ok', products })
        } catch {
            dispatch({ type: 'SET_ARTICLE_45', payload: { requested: true, afm } })
            setStatus({ kind: 'unverified', text: 'Δεν ήταν δυνατός ο έλεγχος τώρα — θα γίνει κατά την ολοκλήρωση της παραγγελίας.' })
        }
    }

    const setField = (patch: Partial<NonNullable<typeof a45>>) => {
        if (!a45) return
        dispatch({ type: 'SET_ARTICLE_45', payload: { ...a45, ...patch } })
        setRepr({ kind: 'idle' })
    }

    const reprNo = a45?.reprIdentityNo ?? ''
    const reprMobile = a45?.reprMobile ?? ''
    const mobileOk = !reprMobile || /^\+?\d{10,15}$/.test(reprMobile.replace(/[\s-]/g, ''))
    const canVerify = !!a45?.reprIdentityType && reprNo.trim().length === 5 && mobileOk

    const verify = async () => {
        if (!a45 || !canVerify) return
        setRepr({ kind: 'checking' })
        try {
            const { ok, data } = await check({
                reprIdentityType: a45.reprIdentityType,
                reprIdentityNo: reprNo.trim(),
                reprMobile: reprMobile.replace(/[\s-]/g, '') || undefined,
            })
            if (!ok) {
                setRepr({ kind: 'failed', text: `${data?.message || 'Η ΑΑΔΕ δεν απαντά.'} Μπορείτε να συνεχίσετε — η ταυτοποίηση θα γίνει από εμάς.` })
            } else if (data.identityVerified) {
                setRepr({ kind: 'verified', otpRequired: !!data.otpRequired })
            } else if (data.buyerEligible === false) {
                setRepr({ kind: 'failed', text: 'Σύμφωνα με την ΑΑΔΕ, το Α.Φ.Μ. δεν είναι σε κανονικό καθεστώς ΦΠΑ.' })
            } else {
                setRepr({ kind: 'failed', text: 'Η ΑΑΔΕ δεν επιβεβαίωσε τα στοιχεία του εκπροσώπου. Ελέγξτε τα ή συνεχίστε χωρίς αυτά — η ταυτοποίηση θα γίνει από εμάς.' })
            }
        } catch {
            setRepr({ kind: 'failed', text: 'Δεν ήταν δυνατή η επαλήθευση τώρα. Μπορείτε να συνεχίσετε.' })
        }
    }

    return (
        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <label className="flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={requested}
                    disabled={status.kind === 'checking'}
                    onChange={(e) => toggle(e.target.checked)}
                />
                <span className="text-sm text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">Απαλλαγή ΦΠΑ — άρθρο 45 (πρώην 39α)</span>
                    <span className="block text-slate-600 dark:text-slate-400">
                        Για επιχειρήσεις σε κανονικό καθεστώς ΦΠΑ. Ισχύει μόνο για συγκεκριμένες κατηγορίες προϊόντων·
                        ο έλεγχος γίνεται στην ΑΑΔΕ.
                    </span>
                </span>
            </label>

            {status.kind === 'checking' && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Έλεγχος στην ΑΑΔΕ…</p>}
            {status.kind === 'rejected' && <p role="status" className="mt-3 text-sm text-red-600 dark:text-red-400">{status.text}</p>}
            {status.kind === 'unverified' && <p role="status" className="mt-3 text-sm text-amber-700 dark:text-amber-300">{status.text}</p>}

            {requested && (
                <div className="mt-4 space-y-4">
                    {status.kind === 'ok' && (
                        <p role="status" className="text-sm text-green-700 dark:text-green-300">
                            ✔️ Η ΑΑΔΕ επιβεβαιώνει κανονικό καθεστώς ΦΠΑ. Τα επιλέξιμα προϊόντα χρεώνονται χωρίς ΦΠΑ.
                        </p>
                    )}
                    {status.kind === 'ok' && status.products?.warning && (
                        <p className="text-sm text-amber-700 dark:text-amber-300">{status.products.warning}</p>
                    )}

                    <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Στοιχεία εκπροσώπου (προαιρετικά)</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Τα ζητά η ΑΑΔΕ για την ταυτοποίηση του αγοραστή. Αν δεν τα συμπληρώσετε, θα επικοινωνήσουμε μαζί σας
                            πριν την έκδοση του τιμολογίου.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="a45-type" className="mb-1 block text-sm text-gray-700 dark:text-slate-300">Τύπος ταυτότητας</label>
                            <select
                                id="a45-type"
                                className={inputClass}
                                value={a45?.reprIdentityType ?? ''}
                                onChange={(e) => setField({ reprIdentityType: e.target.value ? Number(e.target.value) : null })}
                            >
                                <option value="">— Επιλέξτε —</option>
                                {AADE_IDENTITY_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="a45-no" className="mb-1 block text-sm text-gray-700 dark:text-slate-300">5 τελευταίοι χαρακτήρες</label>
                            <input
                                id="a45-no"
                                className={inputClass}
                                maxLength={5}
                                autoComplete="off"
                                value={reprNo}
                                onChange={(e) => setField({ reprIdentityNo: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label htmlFor="a45-mobile" className="mb-1 block text-sm text-gray-700 dark:text-slate-300">Κινητό εκπροσώπου</label>
                            <input
                                id="a45-mobile"
                                className={inputClass}
                                inputMode="tel"
                                autoComplete="off"
                                value={reprMobile}
                                onChange={(e) => setField({ reprMobile: e.target.value })}
                            />
                            {!mobileOk && <small className="text-xs text-red-500">Μη έγκυρο κινητό</small>}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={verify}
                            disabled={!canVerify || repr.kind === 'checking'}
                            className="rounded-lg border border-siteColors-purple px-4 py-2 text-sm font-semibold text-siteColors-purple hover:bg-siteColors-purple hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-300 dark:text-slate-200"
                        >
                            {repr.kind === 'checking' ? 'Επαλήθευση…' : 'Επαλήθευση στην ΑΑΔΕ'}
                        </button>
                        {repr.kind === 'verified' && (
                            <span role="status" className="text-sm text-green-700 dark:text-green-300">✔️ Τα στοιχεία επαληθεύτηκαν.</span>
                        )}
                        {repr.kind === 'failed' && <span role="status" className="text-sm text-amber-700 dark:text-amber-300">{repr.text}</span>}
                    </div>

                    {/* (2026-11-27) Η ΑΑΔΕ ΔΕΝ στέλνει SMS. Τον κωδικό μιας χρήσης τον εκδίδει η ίδια η επιχείρηση-αγοραστής
                        στην εφαρμογή «Υπηρεσία άρθρου 39α» της ΑΑΔΕ (Διαχείριση Κωδικών Μιας Χρήσης Εκπροσώπου), μόνο αν
                        έχει δηλώσει ότι τον απαιτεί για τον εκπρόσωπο. */}
                    {repr.kind === 'verified' && repr.otpRequired && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
                            <p className="text-sm text-slate-800 dark:text-slate-200">
                                Η επιχείρησή σας έχει δηλώσει στην ΑΑΔΕ ότι για αυτόν τον εκπρόσωπο απαιτείται <strong>κωδικός μιας χρήσης</strong>.
                                Ο κωδικός <strong>δεν αποστέλλεται με SMS</strong>· τον δημιουργεί η επιχείρηση στην εφαρμογή «Υπηρεσία άρθρου 39α»
                                της ΑΑΔΕ (Διαχείριση Κωδικών Μιας Χρήσης Εκπροσώπου).
                            </p>
                            <div className="mt-3 max-w-[220px]">
                                <label htmlFor="a45-otp" className="mb-1 block text-sm text-gray-700 dark:text-slate-300">Κωδικός μιας χρήσης (6 ψηφία)</label>
                                <input
                                    id="a45-otp"
                                    className={inputClass}
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    value={a45?.otpId ?? ''}
                                    onChange={(e) => a45 && dispatch({ type: 'SET_ARTICLE_45', payload: { ...a45, otpId: e.target.value.replace(/\D/g, '') } })}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                                Προαιρετικό τώρα — αν δεν τον έχετε, θα σας τον ζητήσουμε πριν την έκδοση του τιμολογίου. Ο κωδικός πρέπει να είναι ενεργός εκείνη τη στιγμή.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
