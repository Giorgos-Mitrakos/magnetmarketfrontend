import Menu from "@/components/molecules/sideMenu";
import ProductCard from "@/components/organisms/productCard";
import CategoryPageHeader from "../organisms/categoryPageHeader";
import PaginationBar from "../molecules/pagination";
import CategoryFilters from "../organisms/categoryFilters";
import SiteFeaturesFromAdmin from "../organisms/siteFeaturesFromAdmin";
import MobileFilters from "../organisms/mobileFilters";
import Breadcrumb from "../molecules/breadcrumb";
import { IProductCard } from "@/lib/interfaces/product";
import { FilterProps } from "@/lib/interfaces/filters";
import AvailabilityFilter from "../molecules/AvailabilityFilter";
import SubcategoryStrip, { SubcategoryItem } from "../molecules/SubcategoryStrip";
import CategoryDescription from "../molecules/CategoryDescription";
import ActiveFilters from "../molecules/ActiveFilters";
import EmptyResults from "../molecules/EmptyResults";
import Link from "next/link";

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
    title: string
    description?: string | null
    subcategories?: SubcategoryItem[]
    availableFilters: FilterProps[]
    priceRange?: { min: number, max: number } | null
    products: IProductCard[]
    meta: {
        pagination: {
            total: number
            page: number
            pageSize: number
            pageCount: number
        }
    }
    sideMenu: SideMenuType | null
    breadcrumbs: BreadcrumbType[]
    /** (2026-10-27) Σελίδες «κατηγορία + μάρκα» (π.χ. «Κάμερες Ezviz») */
    brandLinks?: { name: string, href: string, count: number }[]
}

function CategoryPageTemplate({
    category1,
    category2,
    category3,
    title,
    description,
    subcategories = [],
    availableFilters,
    priceRange = null,
    products,
    meta,
    sideMenu,
    breadcrumbs,
    brandLinks = [],
}: CategoryPageTemplateProps) {

    return (
        <div className="w-full flex flex-col">
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <h1 className="w-full mt-6 text-2xl font-semibold text-center text-siteColors-purple dark:text-slate-300">
                {title}
            </h1>
            {description && <CategoryDescription text={description} />}
            {subcategories.length > 0 && <SubcategoryStrip items={subcategories} />}
            <div className="grid pt-4 mb-8 w-full bg-white dark:bg-slate-800">
                <div className="grid lg:grid-cols-4 gap-4">
                    <div className="hidden lg:flex lg:flex-col bg-slate-50 dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                        {sideMenu && (
                            <Menu
                                category1={category1}
                                category2={category2 ?? null}
                                category3={category3 ?? null}
                                sideMenu={sideMenu}
                            />
                        )}
                        <CategoryFilters availableFilters={availableFilters} priceRange={priceRange} idPrefix="d" />
                    </div>
                    <div className="flex flex-col px-2 lg:pl-0 lg:pr-4 col-span-3 w-full min-w-0">
                        <CategoryPageHeader totalItems={meta.pagination.total} showNewest />
                        <AvailabilityFilter showSale />
                        <ActiveFilters availableFilters={availableFilters} />
                        {products.length === 0 ? (
                            <EmptyResults />
                        ) : (
                            <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </section>
                        )}
                        <MobileFilters
                            availableFilters={availableFilters}
                            priceRange={priceRange}
                            totalItems={meta.pagination.total}
                        />
                        <PaginationBar
                            totalItems={meta.pagination.total}
                            currentPage={meta.pagination.page}
                            itemsPerPage={meta.pagination.pageSize}
                        />
                    </div>
                </div>
            </div>
            {brandLinks.length > 1 && (
                <nav aria-labelledby="category-brands" className="mb-8 px-2">
                    <h2 id="category-brands" className="mb-3 text-lg font-semibold text-siteColors-purple dark:text-slate-200">
                        {title} ανά κατασκευαστή
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                        {brandLinks.map(b => (
                            <li key={b.href}>
                                <Link
                                    href={b.href}
                                    className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-siteColors-purple hover:text-siteColors-purple dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                >
                                    {b.name} <span className="opacity-60">({b.count})</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
            {/* (2026-10-26) Οι παροχές στο τέλος: στην κορυφή έσπρωχναν τα προϊόντα κάτω στο κινητό */}
            <SiteFeaturesFromAdmin />
        </div>
    )
}

export default CategoryPageTemplate
