// components/organisms/searchFilters.tsx (Server Component)
import { FilterProps } from '@/lib/interfaces/filters';
import ProductFilter from '../molecules/productFilter';

const SearchFilters = ({ searchFilters }: { searchFilters: FilterProps[] }) => {
    return (
        <div className='space-y-4 p-4 rounded'>
            {!searchFilters ? (
                <div>Loading</div>
            ) : (
                searchFilters.map(filter => (
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

export default SearchFilters