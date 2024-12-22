'use client'
import { GET_CATEGORY_BRANDS, GET_CATEGORY_FILTERS, GET_CATEGORY_INITIAL_FILTER_VALUES, GET_NUMBER_OF_CATEGORY_BRAND_PRODUCTS, IcategoryBrandsProps, IcategoryFilterValuesProps, IcategoryFiltersProps, IimageProps } from '@/lib/queries/categoryQuery';
import { requestSSR } from '@/repositories/repository';
import ProductFilter from '../molecules/productFilter';
import { useApiRequest } from '@/repositories/clientRepository';
import { json } from 'stream/consumers';
import { string } from 'yup';

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

interface ProductProps {
    id: number
    attributes: {
        name: string
        slug: string
        prod_chars: {
            name: string
            value: string
        }[]
        brand: {
            data: {
                attributes: {
                    name: string,
                    slug: string,
                    logo: {
                        data: {
                            attributes: {
                                name: string
                                url: string
                                formats: {
                                    thumbnail: IimageProps,
                                    small: IimageProps
                                }
                            }
                        }
                    }
                }
            }
        }
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