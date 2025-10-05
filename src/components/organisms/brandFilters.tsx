import ProductFilter from "../molecules/productFilter"
import { FilterProps } from "@/lib/interfaces/filters"

interface SearchFiltersProps {
    searchParams: { [key: string]: string | string[] | undefined }
    brand: string
}

const BrandFilters = ({ filters }: { filters: FilterProps[] }) => {

    return (
        <div className='space-y-4 p-4 rounded'>
            {filters && filters.length > 0 && filters.map(filter => (
                <ProductFilter key={filter.title} title={filter.title} filterBy={filter.title} filters={filter.filterValues} />
            ))}
        </div>
    )
}

export default BrandFilters