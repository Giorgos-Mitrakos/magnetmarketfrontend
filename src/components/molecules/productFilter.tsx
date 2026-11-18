'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { trackFilterUsage } from '@/lib/helpers/advanced-analytics';

interface FilterProps {
    title: string,
    filterBy: string,
    filters: {
        name: string,
        slug?: string,
        numberOfItems: number
    }[]
    /** Μοναδικά ids όταν το ίδιο φίλτρο εμφανίζεται δύο φορές στη σελίδα (υπολογιστής + κινητό) */
    idPrefix?: string
}

/** Τιμή φίλτρου όπως μπαίνει στη διεύθυνση (πεζά) */
const valueOf = (f: { name: string, slug?: string }) => (f.slug ? f.slug : f.name).toLowerCase()

const ProductFilter = (props: FilterProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [selectedFilters, setSelectedFilters] = useState<string[]>(() =>
        searchParams.getAll(props.filterBy).map(filter => filter.toLowerCase())
    )

    // Συγχρονισμός με το URL (π.χ. «πίσω» στον browser ή αφαίρεση από τα ενεργά φίλτρα)
    useEffect(() => {
        setSelectedFilters(searchParams.getAll(props.filterBy).map(filter => filter.toLowerCase()))
    }, [searchParams, props.filterBy])

    const handleItemClick = (filterValue: string) => {
        const current = searchParams.getAll(props.filterBy).map(v => v.toLowerCase())
        const isCurrentlySelected = current.includes(filterValue)

        if (!isCurrentlySelected) {
            trackFilterUsage(props.filterBy, filterValue);
        }

        const params = new URLSearchParams(searchParams.toString())
        params.delete(props.filterBy)
        const next = isCurrentlySelected ? current.filter(v => v !== filterValue) : [...current, filterValue]
        next.forEach(v => params.append(props.filterBy, v))
        params.delete("page")

        // Άμεση ένδειξη στο checkbox, πριν φορτώσει η νέα λίστα
        setSelectedFilters(next)
        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }

    const prefix = `${props.idPrefix ?? ''}${props.filterBy}`.replace(/\s+/g, '-')

    return (
        <div className="mb-6">
            <h2 className='text-lg font-semibold text-gray-900 dark:text-slate-100 pb-3 mb-3 border-b border-gray-200 dark:border-slate-600'>
                {props.title}
            </h2>
            <div className='max-h-48 overflow-y-auto p-3 scrollbar border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm'>
                {props.filters.map((filter, i) => {
                    const filterValue = valueOf(filter);
                    const isSelected = selectedFilters.includes(filterValue);
                    // Επιλεγμένο φίλτρο με 0 μένει ενεργό, για να μπορεί να αφαιρεθεί
                    const isDisabled = filter.numberOfItems === 0 && !isSelected;
                    const id = `${prefix}-${i}`

                    return (
                        <label
                            key={filterValue}
                            htmlFor={id}
                            className={`flex items-center py-2 px-2 rounded-md transition-colors ${isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <input
                                id={id}
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => handleItemClick(filterValue)}
                                className="w-4 h-4 shrink-0 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 
                                    dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className={`ml-3 text-sm ${isDisabled ? "text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-slate-300"} ${isSelected ? "font-medium" : ""}`}>
                                {filter.name} <span className="text-gray-500 dark:text-slate-400 ml-1">({filter.numberOfItems})</span>
                            </span>
                        </label>
                    )
                })}
            </div>
        </div>
    )
}

export default memo(ProductFilter)
