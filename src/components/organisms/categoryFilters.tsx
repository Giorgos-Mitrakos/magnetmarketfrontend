import { GET_CATEGORY_BRANDS, GET_CATEGORY_FILTERS, GET_CATEGORY_INITIAL_FILTER_VALUES, GET_NUMBER_OF_CATEGORY_BRAND_PRODUCTS, IcategoryBrandsProps, IcategoryFilterValuesProps, IcategoryFiltersProps, IimageProps } from '@/lib/queries/categoryQuery';
import { requestSSR } from '@/repositories/repository';
import ProductFilter from '../molecules/productFilter';

export interface CategoryFiltersProps {
    category1: string,
    category2: string | null | undefined,
    category3: string | null | undefined,
    products: ProductProps[],
    allProducts: ProductProps[],
    searchParams: { [key: string]: string | string[] | undefined }
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

const getBrands = async (props: CategoryFiltersProps) => {
    const brands: { name: string, slug: string, numberOfItems: number }[] = []
    props.allProducts.forEach(product => {
        if (product.attributes.brand.data) {
            let productExistsIndex = brands.findIndex(x => x.slug === product.attributes.brand.data.attributes.slug)

            if (props.products.find(x => x.attributes.slug === product.attributes.slug)) {
                if (productExistsIndex !== -1) {
                    ++brands[productExistsIndex].numberOfItems
                }
                else {
                    brands.push({ name: product.attributes.brand.data.attributes.name.toLowerCase(), slug: product.attributes.brand.data.attributes.slug, numberOfItems: 1 })
                }
            }
            else {
                if (productExistsIndex === -1) {
                    brands.push({ name: product.attributes.brand.data.attributes.name.toLowerCase(), slug: product.attributes.brand.data.attributes.slug, numberOfItems: 0 })
                }
            }
        }
    })

    let sortedBrands = brands.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    })

    return sortedBrands
}

const getCategoryFilters = async (props: CategoryFiltersProps) => {
    const data = await requestSSR({
        query: GET_CATEGORY_FILTERS, variables: { category: props.category3 ? props.category3 : props.category2 ? props.category2 : props.category1 }
    });

    const response = data as IcategoryFiltersProps

    const filters: {
        title: string;
        filterValues:
        {
            name: string,
            numberOfItems: number
        }[]

    }[] = []

    response.categories.data[0].attributes.filters.forEach(filt => {
        let filter: { title: string, filterValues: { name: string, numberOfItems: number }[] } = { title: filt.name, filterValues: [] }

        props.allProducts.forEach(product => {
            let productChar = product.attributes.prod_chars.findIndex(x => x.name === filt.name)

            if (productChar !== -1) {
                let filterExistsIndex = filter.filterValues.findIndex(x => x.name === product.attributes.prod_chars[productChar].value)

                if (props.products.find(x => x.attributes.slug === product.attributes.slug)) {

                    if (filterExistsIndex !== -1) {
                        ++filter.filterValues[filterExistsIndex].numberOfItems
                    }
                    else {
                        filter.filterValues.push({ name: product.attributes.prod_chars[productChar].value, numberOfItems: 1 })
                    }
                }
                else {
                    // let filterExistsIndex = filter.filterValues.findIndex(x => x.name === product.attributes.prod_chars[productChar].value)
                    if (filterExistsIndex === -1) {
                        filter.filterValues.push({ name: product.attributes.prod_chars[productChar].value, numberOfItems: 0 })
                    }
                }
            }
        })

        let sortedfilters = filter.filterValues.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        })

        filters.push({ title: filter.title, filterValues: sortedfilters })
    })

    return filters
}

const CategoryFilters = async (props: CategoryFiltersProps) => {

    const brands = await getBrands(props)
    const filters = await getCategoryFilters(props)

    return (
        <div className='mt-4 space-y-4'>
            <ProductFilter title="Εταιρίες" filterBy="brands" filters={brands} />
            {
                filters.length > 0 &&
                filters.map(filter => (
                    <ProductFilter key={filter.title} title={filter.title} filterBy={filter.title} filters={filter.filterValues} />
                ))
            }
        </div>
    )
}

export default CategoryFilters