'use client'
import { useApiRequest } from "@/repositories/clientRepository"
import ProductFilter from "../molecules/productFilter"

interface SearchFiltersProps {
    searchParams: { [key: string]: string | string[] | undefined }
    brand: string
}

interface FilterProps {
    title: string,
    filterValues: {
        name: string,
        slug: string,
        numberOfItems: number
    }[]
}

const BrandFilters = (props: SearchFiltersProps) => {

    const { data: filters, loading: loadingFilters, error: errorFilters }: {
        data: FilterProps[], loading: boolean, error: any
    } = useApiRequest({ method: 'POST', api: "/api/product/brandFilters", variables: ({ brand: props.brand, searchParams: props.searchParams }), jwt: "" })

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

export default BrandFilters