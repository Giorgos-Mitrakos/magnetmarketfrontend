'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export default function StockFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    
    const isOnlyStock = searchParams.get('stock') === 'true'

    const handleToggle = (checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (checked) {
            params.set('stock', 'true')
        } else {
            params.delete('stock')
        }
        
        params.delete('page') // Reset στη σελίδα 1

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    return (
        <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isOnlyStock}
                    onChange={(e) => handleToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Άμεσα Διαθέσιμα
                </span>
            </label>
        </div>
    )
}