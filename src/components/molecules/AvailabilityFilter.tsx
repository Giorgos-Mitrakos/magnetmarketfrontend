'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

/** Διακόπτης on/off που γράφει `key=true` στη διεύθυνση */
function Toggle({ label, paramKey, color }: { label: string, paramKey: string, color: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const checked = searchParams.get(paramKey) === 'true'

    const handleToggle = (value: boolean) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(paramKey, 'true')
        else params.delete(paramKey)
        params.delete('page') // Reset στη σελίδα 1

        startTransition(() => {
            const qs = params.toString()
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
        })
    }

    return (
        <label className={`relative inline-flex items-center cursor-pointer transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => handleToggle(e.target.checked)}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${color}`}></div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
        </label>
    )
}

/**
 * «Άμεσα διαθέσιμα» και (2026-10-18, όπου ζητηθεί) «Μόνο προσφορές».
 */
export default function StockFilter({ showSale = false }: { showSale?: boolean }) {
    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4 p-2">
            <Toggle label="Άμεσα διαθέσιμα" paramKey="stock" color="peer-checked:bg-purple-600" />
            {showSale && <Toggle label="Μόνο προσφορές" paramKey="sale" color="peer-checked:bg-red-500" />}
        </div>
    )
}
