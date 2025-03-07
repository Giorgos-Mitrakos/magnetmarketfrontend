'use client'
import { GET_CATEGORY_BRANDS, GET_CATEGORY_FILTERS, GET_CATEGORY_INITIAL_FILTER_VALUES, GET_NUMBER_OF_CATEGORY_BRAND_PRODUCTS, IcategoryFilterValuesProps, IcategoryFiltersProps } from '@/lib/queries/categoryQuery';
import { requestSSR } from '@/repositories/repository';
import ProductFilter from '../molecules/productFilter';
import { useApiRequest } from '@/repositories/clientRepository';
import { json } from 'stream/consumers';
import { string } from 'yup';
import { IProductBrand } from '@/lib/interfaces/product';

export interface CategoryFiltersProps {
    category1: string,
    category2: string | null | undefined,
    category3: string | null | undefined,
    // products: ProductProps[],
    // allProducts: ProductProps[],
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

    const searchParamsArray = Object.keys(props.searchParams).map((key) => (
        {
            name: key,
            value: props.searchParams[key],
        }));

    const category = props.category3 ? props.category3 : props.category2 ? props.category2 : props.category1
    const level = props.category3 ? 3 : props.category2 ? 2 : 1

    const { data: brands, loading: loadingBrands, error: errorBrands }: { data: any, loading: boolean, error: any } = useApiRequest({
        method: 'POST', api: "/api/category/brandFilter",
        variables: ({ name: category, level: level, searchParams: searchParamsArray }), jwt: ""
    })

    const { data: filters, loading: loadingFilters, error: errorFilters }: {
        data: FilterProps[], loading: boolean, error: any
    } = useApiRequest({ method: 'POST', api: "/api/category/categoryFilter", variables: ({ name: category, level: level, searchParams: searchParamsArray }), jwt: "" })

    return (
        <div className='mt-4 space-y-4'>
            {loadingBrands && !brands ? <div>Loading</div> :
                <ProductFilter title="Εταιρίες" filterBy="brands" filters={brands} />}
            {loadingFilters && !filters ? <div>Loading</div> :
                filters && filters.map(filter => (
                    <ProductFilter key={filter.title} title={filter.title} filterBy={filter.title} filters={filter.filterValues} />
                ))

            }
        </div>
    )
}

export default CategoryFilters