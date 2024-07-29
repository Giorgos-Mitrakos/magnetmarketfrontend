import Menu from "@/components/molecules/menu";
import ProductCard from "@/components/organisms/productCard";
import { IcategoryProductsProps } from "@/lib/queries/productQuery";
import CategoryPageHeader from "../organisms/categoryPageHeader";
import PaginationBar from "../molecules/pagination";
import CategoryFilters from "../organisms/categoryFilters";
import { filtersProducts } from "@/lib/helpers/helpers";
import SiteFeatures from "../organisms/siteFeatures";

type pageProps = {
    params: {
        category1: string,
        category2?: string,
        category3?: string | null,
    },
    searchParams: {
        [key: string]: string | string[];
    }
    products: IcategoryProductsProps,
}

async function CategoryPageTemplate(props: pageProps) {

    const { params, products, searchParams } = props
    const { category1, category2, category3 } = params

    // console.log(products)
    const filteredProducts = filtersProducts(products, searchParams)

    return (
        <div className="w-full flex flex-col">
            <SiteFeatures classes="grid lg:divide-x bg-transparent xs:grid-cols-2 gap-2 lg:grid-cols-4 w-full justify-center" />
            <div className="grid pt-32 w-full bg-slate-100">
                <div className="grid lg:grid-cols-4">
                    <div className="mx-4 hidden lg:flex lg:flex-col">
                        <Menu category1={category1} category2={category2 ? category2 : null} category3={category3 ? category3 : null} />
                        <CategoryFilters category1={category1} category2={category2} category3={category3} allProducts={filteredProducts.allProducts} products={filteredProducts.products} searchParams={searchParams} />
                    </div>
                    <div className="flex flex-col col-span-3 w-full">
                        <CategoryPageHeader totalItems={filteredProducts.totalItems} />
                        <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                            {filteredProducts.pageProducts.map(product => (
                                <div key={product.id}>
                                    <ProductCard key={product.id} prod={product} />
                                </div>
                            ))}
                        </section>
                        <PaginationBar totalItems={filteredProducts.totalItems}
                            currentPage={filteredProducts.currentPage}
                            itemsPerPage={filteredProducts.itemsPerPage} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CategoryPageTemplate