import Menu from "@/components/molecules/sideMenu";
import ProductCard from "@/components/organisms/productCard";
import CategoryPageHeader from "../organisms/categoryPageHeader";
import PaginationBar from "../molecules/pagination";
import CategoryFilters from "../organisms/categoryFilters";
import SiteFeatures from "../organisms/siteFeatures";
import MobileFilters from "../organisms/mobileFilters";
import Script from 'next/script'
import Breadcrumb from "../molecules/breadcrumb";
import { IProductCard } from "@/lib/interfaces/product";
import { FilterProps } from "@/lib/interfaces/filters";
import AvailabilityFilter from "../molecules/AvailabilityFilter";

export type SideMenuType = {
    id: number
    name: string
    slug: string
    categories: SideMenuType[]
}

type BreadcrumbType = {
    title: string
    slug: string
}

type CategoryPageTemplateProps = {
    category1: string
    category2: string | null
    category3: string | null
    availableFilters: FilterProps[]
    products: IProductCard[]
    meta: {
        pagination: {
            total: number
            page: number
            pageSize: number
            pageCount: number
        }
    }
    sideMenu: SideMenuType
    breadcrumbs: BreadcrumbType[]
}

function CategoryPageTemplate({
    category1,
    category2,
    category3,
    availableFilters,
    products,
    meta,
    sideMenu,
    breadcrumbs,
}: CategoryPageTemplateProps) {

    return (
        <div className="w-full flex flex-col">
            <SiteFeatures />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <h1 className="w-full mt-8 text-2xl font-semibold text-center text-siteColors-purple dark:text-slate-300">
                {breadcrumbs[breadcrumbs.length - 1].title}
            </h1>
            <div className="grid pt-4 mb-8 w-full bg-white dark:bg-slate-800">
                <div className="grid lg:grid-cols-4 gap-4">
                    <div className="hidden lg:flex lg:flex-col bg-slate-50 dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                        <Menu
                            category1={category1}
                            category2={category2 ?? null}
                            category3={category3 ?? null}
                            sideMenu={sideMenu}
                        />
                        <CategoryFilters availableFilters={availableFilters} />
                    </div>
                    <div className="flex flex-col pr-4 col-span-3 w-full">
                        <CategoryPageHeader totalItems={meta.pagination.total} />
                        <AvailabilityFilter />
                        <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </section>
                        <MobileFilters availableFilters={availableFilters} />
                        <PaginationBar
                            totalItems={meta.pagination.total}
                            currentPage={meta.pagination.page}
                            itemsPerPage={meta.pagination.pageSize}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryPageTemplate