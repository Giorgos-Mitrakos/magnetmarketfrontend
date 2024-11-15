import Link from "next/link";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { useQuery } from "@/repositories/clientRepository";
import ProductCard from "@/components/organisms/productCard";
import { requestSSR } from "@/repositories/repository";


interface ProductGroupByCategoryProps {
    promos: categoryPromoProps,
}

interface categoryProductsProps {
    data: { products: { data: ProductProps[] } }
    loading: boolean
    error: { message: string }
}

const GET_CATEGORIES = gql`
    query categoryProducts(
        $filter: [String],
        $items:Int
      ) {
        products (filters:{
        categories:{slug:{in: $filter}}},pagination:{limit:$items}){
          data {
            attributes {
              name
              slug
              price
              sale_price
              image{
                data{
                  attributes{
                    alternativeText
                    url
                    formats
                  }
                }
              }
            }
          }
        }
      }                    
        `;

const getCategoriesProducts = async (queryParams: string[]) => {
    const [items, setItems] = useState(4)
    let variab = queryParams
    useEffect(() => {

        if (isMobile) {
            setItems(2)
        }
        else {
            setItems(4)
        }
    }, [])

    const data = await requestSSR({
        query: GET_CATEGORIES, variables: {}
    });

    const { loading, error, data } = useQuery({ query: GET_CATEGORIES, variables: { filter: variab, items: items } });

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`
    return (
        data?.products.data.map((prod, i) => (
            <ProductCard key={i} prod={prod} />
        ))
    )
}

const ProductGroupByCategory = (props: ProductGroupByCategoryProps) => {
    const { promos } = props;
    const { header, links, categories, url } = promos;

    let queryParams = [];
    queryParams = categories.data.map(x => x.attributes.slug);

    return (
        <section className="w-full mx-auto mb-4 md:mb-16 last:mb-0">
            <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
                <div className="flex md:grid md:grid-rows-8 px-4 py-2 justify-between items-center md:items-start">
                    <h3 className="text-lg font-semibold">{header}</h3>
                    <ul className="hidden text-sm font-semibold text-siteColors-blue md:flex md:flex-col md:row-span-6">
                        {links.map((link, i) =>
                            <li className="my-1" key={i}>
                                <Link href={link.url}>
                                    <a>{link.name}</a>
                                </Link>
                            </li>
                        )}
                    </ul>
                    <Link href={url}>
                        <a className="text-base text-slate-500 italic hover:underline underline-offset-2">
                            Όλα
                        </a>
                    </Link>
                </div>
                <div className="grid gap-1 md:gap-0 xs:grid-cols-2 md:col-span-2 lg:col-span-4 lg:grid-cols-4 2xl:grid-cols-5 2xl:col-span-5">
                    {getCategoriesProducts(queryParams)}
                </div>
            </div>
        </section>
    );
}

export default ProductGroupByCategory