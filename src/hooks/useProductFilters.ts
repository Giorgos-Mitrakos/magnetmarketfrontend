import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

export default function useProductFilters(filterBy: string) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const search = searchParams.getAll(filterBy)

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
        setSelectedFilters(() => {
            if (selectedFilters.includes(filter.toLowerCase())) {
                let filters = selectedFilters.filter(x => x !== filter.toLowerCase())

                return filters
            }
            else {
                return [...selectedFilters, filter.toLowerCase()]
            }
        })
    }

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        params.delete(filterBy)

        selectedFilters.forEach(x => {
            params.append(filterBy, x)
        })

        router.push(pathname + '?' + params)
    }, [selectedFilters, router, searchParams, pathname, filterBy])

    return [selectedFilters, handleItemClick] as const
}