import Menu from "@/components/molecules/sideMenu";
import ProductCard from "@/components/organisms/productCard";
import CategoryPageHeader from "../organisms/categoryPageHeader";
import PaginationBar from "../molecules/pagination";
import CategoryFilters from "../organisms/categoryFilters";
import SiteFeatures from "../organisms/siteFeatures";
import MobileFilters from "../organisms/mobileFilters";
import Script from 'next/script'
import Breadcrumb from "../molecules/breadcrumb";
import { organizationStructuredData } from "@/lib/helpers/structureData";
import { IProductCard } from "@/lib/interfaces/product";
import { FilterProps } from "@/lib/interfaces/filters";
import { getCategoryProducts } from "@/lib/queries/categoryQuery";

type pageProps = {
    params: {
        category1: string,
        category2?: string,
        category3?: string | null,
    },
    searchParams: { [key: string]: string | string[] }
}

export type sideMenuType = {
    id: number
    name: string
    slug: string
    categories: sideMenuType[]
}

type responseType = {
    availableFilters: FilterProps[],
    meta: { pagination: { total: number, page: number, pageSize: number, pageCount: number } },
    products: IProductCard[],
    sideMenu: sideMenuType,
    breadcrumbs: {
        title: string,
        slug: string
    }[]
}

async function CategoryPageTemplate({ params, searchParams }: pageProps) {

    // const { params, products, availableFilters, meta } = props
    const { category1, category2, category3 } = params

    const response = await getCategoryProducts(
        category1,
        category3 ? category3 : category2 ? category2 : category1,
        searchParams
    )

    const data = response as responseType

    const { availableFilters, products, meta, breadcrumbs, sideMenu } = data

    const BreadcrumbList = breadcrumbs.map((breabcrumb, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": breabcrumb.title,
        "item": `${process.env.NEXT_URL}${breabcrumb.slug}`
    }))

    const BreadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": BreadcrumbList
    }

    const structuredData = []
    structuredData.push(BreadcrumbStructuredData)
    structuredData.push(organizationStructuredData)

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <div className="w-full flex flex-col">
                <SiteFeatures />
                <Breadcrumb breadcrumbs={breadcrumbs} />
                <h1 className="w-full mt-8 text-2xl font-semibold text-center text-siteColors-purple dark:text-slate-300">{breadcrumbs[breadcrumbs.length - 1].title}</h1>
                <div className="grid pt-4 mb-8 w-full bg-white dark:bg-slate-800">
                    <div className="grid lg:grid-cols-4 gap-4">
                        <div className="hidden lg:flex lg:flex-col bg-slate-50 dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                            <Menu category1={category1} category2={category2 ? category2 : null} category3={category3 ? category3 : null} sideMenu={sideMenu} />
                            <CategoryFilters availableFilters={availableFilters} />
                        </div>
                        <div className="flex flex-col pr-4 col-span-3 w-full ">
                            <CategoryPageHeader totalItems={meta.pagination.total} />
                            <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                                {products.map(product => (
                                    <div key={product.id}>
                                        <ProductCard key={product.id} product={product} />
                                    </div>
                                ))}
                            </section>
                            <MobileFilters availableFilters={availableFilters} />
                            <PaginationBar totalItems={meta.pagination.total}
                                currentPage={meta.pagination.page}
                                itemsPerPage={meta.pagination.pageSize} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CategoryPageTemplate