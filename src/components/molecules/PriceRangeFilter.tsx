'use client'
// Φίλτρο εύρους τιμής «από / έως» (2026-10-18) — με την τελική τιμή (προσφοράς αν ισχύει)
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

export default function PriceRangeFilter({ range, idPrefix = '' }: { range: { min: number, max: number } | null, idPrefix?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [min, setMin] = useState(searchParams.get('price_min') ?? '')
    const [max, setMax] = useState(searchParams.get('price_max') ?? '')

    // Συγχρονισμός με τη διεύθυνση (π.χ. «πίσω» ή αφαίρεση από τα ενεργά φίλτρα)
    useEffect(() => {
        setMin(searchParams.get('price_min') ?? '')
        setMax(searchParams.get('price_max') ?? '')
    }, [searchParams])

    if (!range && !min && !max) return null

    const apply = (e: FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        const clean = (v: string) => v.trim().replace(',', '.')
        if (clean(min)) params.set('price_min', clean(min)); else params.delete('price_min')
        if (clean(max)) params.set('price_max', clean(max)); else params.delete('price_max')
        params.delete('page')
        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }

    const input = "w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"

    return (
        <form onSubmit={apply} className="mb-6">
            <h2 className="mb-3 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900 dark:border-slate-600 dark:text-slate-100">
                Τιμή
            </h2>
            <div className="flex items-end gap-2">
                <label className="flex-1 text-xs text-gray-600 dark:text-gray-300" htmlFor={`${idPrefix}price-min`}>
                    Από (€)
                    <input id={`${idPrefix}price-min`} type="number" inputMode="decimal" min={0} step="1" value={min}
                        placeholder={range ? String(range.min) : ''} onChange={e => setMin(e.target.value)} className={input} />
                </label>
                <label className="flex-1 text-xs text-gray-600 dark:text-gray-300" htmlFor={`${idPrefix}price-max`}>
                    Έως (€)
                    <input id={`${idPrefix}price-max`} type="number" inputMode="decimal" min={0} step="1" value={max}
                        placeholder={range ? String(range.max) : ''} onChange={e => setMax(e.target.value)} className={input} />
                </label>
                <button type="submit" className="rounded-md bg-siteColors-blue px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                    OK
                </button>
            </div>
        </form>
    )
}
