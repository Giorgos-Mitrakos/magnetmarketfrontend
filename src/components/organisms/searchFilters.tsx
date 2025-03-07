'use client'
import ProductFilter from '../molecules/productFilter';
import { useApiRequest } from '@/repositories/clientRepository';

interface SearchFiltersProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

interface FilterProps {
    title: string,
    filterValues: {
        name: string,
        slug?: string,
        numberOfItems: number
    }[]
}

const SearchFilters = (props: SearchFiltersProps) => {

    const { data: filters, loading: loadingFilters, error: errorFilters }: {
        data: FilterProps[], loading: boolean, error: any
    } = useApiRequest({ method: 'POST', api: "/api/product/searchFilters", variables: ({ searchParams: props.searchParams }), jwt: "" })

    return (
        <div className='space-y-4 p-4 rounded'>
            {loadingFilters && !filters ? <div>Loading</div> :
                filters && filters.map(filter => (
                    <ProductFilter key={filter.title} title={filter.title} filterBy={filter.title} filters={filter.filterValues} />
                ))

            }
        </div>
    )
}

export default SearchFilters