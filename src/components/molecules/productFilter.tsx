'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { memo, useState } from 'react';

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

        router.push(pathname + '?' + params)
    }

    return (
        <div>
            <h2 className='border-b-2 border-black py-2 text-lg uppercase'>{props.title}</h2>
            <ul className='mt-4 max-h-32 overflow-y-auto custom-scrollbar cursor-pointer'>
                {props.filters.map(filter => (
                    <li key={filter.slug ? filter.slug : filter.name} >
                        <input id={`${filter.name}-checkbox`} type="checkbox"
                            checked={selectedFilters.includes(filter.name.toLowerCase())}
                            disabled={filter.numberOfItems === 0}
                            onChange={() => handleItemClick(filter.name)}
                            className="w-4 h-4 text-gray-500 bg-gray-100 border-gray-300 rounded focus:ring-gray-300 
                        dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            aria-label={`${selectedFilters.includes(filter.name.toLowerCase()) ? 'Αποεπιλογή' : 'Επιλογή'} φίλτρου ${filter.name}`} />
                        <label htmlFor={`${filter.name}-checkbox`}
                            className={`ml-2 text-sm capitalize font-medium ${filter.numberOfItems > 0 ? "text-gray-900" : "text-gray-400"}  dark:text-gray-300 uppercase`}
                            aria-label={`${filter.name} (${filter.numberOfItems})`}>
                            {filter.name} ({filter.numberOfItems})
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default memo(ProductFilter)