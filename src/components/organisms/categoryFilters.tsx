'use client'
import ProductFilter from '../molecules/productFilter';
import { useApiRequest } from '@/repositories/clientRepository';
import { IProductBrand } from '@/lib/interfaces/product';

export interface CategoryFiltersProps {
    category1: string,
    category2: string | null | undefined,
    category3: string | null | undefined,
    searchParams: { [key: string]: string | string[] | undefined }
}

interface FilterProps {
    title: string,
    filterValues: {
        name: string,
        slug: string,
        numberOfItems: number
    }[]
}

interface ProductProps {
    id: number
    attributes: {
        name: string
        slug: string
        prod_chars: {
            name: string
            value: string
        }[]
        brand: { data: IProductBrand }
        image: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        }
    }
}

interface metaProps {
    products: {
        meta: {
            pagination: {
                total: number
            }
        }
    }
}

const CategoryFilters = (props: CategoryFiltersProps) => {
    const searchParamsArray = Object.keys(props.searchParams).map((key) => ({
        name: key,
        value: props.searchParams[key],
    }));

    const category = props.category3 ? props.category3 : props.category2 ? props.category2 : props.category1
    const level = props.category3 ? 3 : props.category2 ? 2 : 1

    const { data: brands, loading: loadingBrands, error: errorBrands }: { data: any, loading: boolean, error: any } = useApiRequest({
        method: 'POST', 
        api: "/api/category/brandFilter",
        variables: { name: category, level: level, searchParams: searchParamsArray }, 
        jwt: ""
    })

    const { data: filters, loading: loadingFilters, error: errorFilters }: {
        data: FilterProps[], loading: boolean, error: any
    } = useApiRequest({ 
        method: 'POST', 
        api: "/api/category/categoryFilter", 
        variables: { name: category, level: level, searchParams: searchParamsArray }, 
        jwt: "" 
    })

    return (
        <div className="mt-6 space-y-6">
            {loadingBrands && !brands ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            ) : (
                <ProductFilter 
                    title="Εταιρείες" 
                    filterBy="brands" 
                    filters={brands} 
                />
            )}
            
            {loadingFilters && !filters ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            ) : (
                filters && filters.map(filter => (
                    <ProductFilter 
                        key={filter.title} 
                        title={filter.title} 
                        filterBy={filter.title} 
                        filters={filter.filterValues} 
                    />
                ))
            )}
        </div>
    )
}

export default CategoryFilters