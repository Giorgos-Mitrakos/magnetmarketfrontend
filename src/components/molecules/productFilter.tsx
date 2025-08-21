'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

interface FilterProps {
    title: string,
    filterBy: string,
    filters: {
        name: string,
        slug?: string,
        numberOfItems: number
    }[]
}

const ProductFilter = (props: FilterProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const search = searchParams.getAll(props.filterBy)
    const [selectedFilters, setSelectedFilters] = useState<string[]>(() => {
        const filters: string[] = []
        if (search) {
            search.forEach(filter => {
                filters.push(filter.toLowerCase())
            });
        }
        return filters
    })

    useEffect(() => {
        const filters: string[] = []
        if (search) {
            search.forEach(filter => {
                filters.push(filter.toLowerCase())
            });
        }

        setSelectedFilters(filters)
    }, [searchParams])

    const handleItemClick = (filter: string) => {
        const params = new URLSearchParams(searchParams)
        if (search.includes(filter.toLowerCase())) {
            params.delete(props.filterBy, filter.toLowerCase())
        }
        else {
            params.append(props.filterBy, filter.toLowerCase())
        }

        if (params.has("page"))
            params.delete("page")

        router.replace(pathname + '?' + params)
    }

    return (
        <div className="mb-6">
            <h2 className='text-lg font-semibold text-gray-900 dark:text-slate-100 pb-3 mb-3 border-b border-gray-200 dark:border-slate-600'>
                {props.title}
            </h2>
            <div className='max-h-48 overflow-y-auto p-3 scrollbar border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm'>
                {props.filters.map(filter => {
                    const filterValue = filter.slug ? filter.slug.toLowerCase() : filter.name.toLowerCase();
                    const isSelected = selectedFilters.includes(filterValue);
                    const isDisabled = filter.numberOfItems === 0;
                    
                    return (
                        <div 
                            key={filter.slug ? filter.slug : filter.name} 
                            className={`flex items-center py-2 px-2 rounded-md transition-colors ${
                                isSelected 
                                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => !isDisabled && handleItemClick(filter.slug ? filter.slug : filter.name)}
                        >
                            <input 
                                id={`${filter.name}-checkbox`} 
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => handleItemClick(filter.slug ? filter.slug : filter.name)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 
                                    dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                aria-label={`${isSelected ? 'Αποεπιλογή' : 'Επιλογή'} φίλτρου ${filter.name}`} 
                            />
                            <label 
                                htmlFor={`${filter.name}-checkbox`}
                                className={`ml-3 text-sm ${isDisabled ? "text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-slate-300"} ${isSelected ? "font-medium" : ""}`}
                                aria-label={`${filter.name} (${filter.numberOfItems})`}
                            >
                                {filter.name} <span className="text-gray-500 dark:text-slate-400 ml-1">({filter.numberOfItems})</span>
                            </label>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default memo(ProductFilter)