
import ProductFilter from '../molecules/productFilter';
import { FilterProps } from '@/lib/interfaces/filters';

export interface CategoryFiltersProps {
    category1: string,
    category2: string | null | undefined,
    category3: string | null | undefined,
    searchParams: { [key: string]: string | string[] | undefined }
}

const CategoryFilters = ({ availableFilters }: { availableFilters: FilterProps[] }) => {

    return (
        <div className="mt-6 space-y-6">

            {!availableFilters ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            ) : (
                availableFilters.map(filter => (
                    <ProductFilter
                        key={filter.title}
                        title={filter.title}
                        filterBy={filter.filterBy}
                        filters={filter.filterValues}
                    />
                ))
            )}
        </div>
    )
}

export default CategoryFilters