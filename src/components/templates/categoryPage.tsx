import Menu from "@/components/molecules/sideMenu";
import ProductCard from "@/components/organisms/productCard";
import { IcategoryProductsProps } from "@/lib/queries/productQuery";
import CategoryPageHeader from "../organisms/categoryPageHeader";
import PaginationBar from "../molecules/pagination";
import CategoryFilters from "../organisms/categoryFilters";
import SiteFeatures from "../organisms/siteFeatures";
import MobileFilters from "../organisms/mobileFilters";
import Script from 'next/script'

type pageProps = {
    params: {
        category1: string,
        category2?: string,
        category3?: string | null,
    },
    searchParams: {
        [key: string]: string | string[];
    }
    products: {
        products: {
            data: IcategoryProductsProps[],
            meta: {
                pagination: {
                    total: number,
                    page: number,
                    pageSize: number,
                    pageCount: number,
                }
            }
        }
    },
}

async function CategoryPageTemplate(props: pageProps) {

    const { params, products, searchParams } = props
    const { category1, category2, category3 } = params

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Title of the blog post',
        description: 'Description of the blog post',
        author: [
            {
                '@type': 'Person',
                name: 'John Doe',
            },
        ],
        datePublished: '2022-09-14T09:00:00.000Z',
    };


    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <div className="w-full flex flex-col">
                <SiteFeatures />
                <div className="grid pt-32 w-full bg-white dark:bg-slate-800">
                    <div className="grid lg:grid-cols-4 gap-4">
                        <div className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded">
                            <Menu category1={category1} category2={category2 ? category2 : null} category3={category3 ? category3 : null} />
                            <CategoryFilters category1={category1} category2={category2} category3={category3} searchParams={searchParams} />
                        </div>
                        <div className="flex flex-col pr-4 col-span-3 w-full">
                            <CategoryPageHeader totalItems={products.products.meta.pagination.total} />
                            <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                                {products.products.data.map(product => (
                                    <div key={product.id}>
                                        <ProductCard key={product.id} prod={product} />
                                    </div>
                                ))}
                            </section>
                            <MobileFilters category1={category1} category2={category2} category3={category3} searchParams={searchParams} />
                            <PaginationBar totalItems={products.products.meta.pagination.total}
                                currentPage={products.products.meta.pagination.page}
                                itemsPerPage={products.products.meta.pagination.pageSize} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CategoryPageTemplate