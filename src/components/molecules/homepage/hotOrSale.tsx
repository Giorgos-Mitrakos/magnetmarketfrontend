'use client'

import { ProductCardSkeleton } from "@/components/organisms/productCard";
import { IProducts } from "@/lib/interfaces/product";
import { GET_HOT_OR_DEALS_PRODUCTS } from "@/lib/queries/productQuery";
import { fetcher } from "@/repositories/repository";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react'

const Carousel = dynamic(() => import('@/components/atoms/carousel'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
})

// Skeleton Component - Updated to match actual component height
const HotOrSaleSkeleton = ({ type }: { type?: string }) => {
    const getHeaderColors = () => {
        switch (type) {
            case 'hot':
                return 'bg-[#a9488e] dark:bg-gradient-to-br dark:from-[#5a2349] dark:to-[#8c3a75] text-white dark:text-slate-200'
            case 'new':
                return 'bg-[#246eb5] dark:bg-gradient-to-br dark:from-[#153a61] dark:to-[#1e5a95] text-white dark:text-slate-200'
            case 'sale':
                return 'bg-[#6e276f] dark:bg-gradient-to-br dark:from-[#3d183e] dark:to-[#5a205b] text-white dark:text-slate-200'
            default:
                return 'bg-[#24488f] dark:bg-gradient-to-br dark:from-[#132247] dark:to-[#1d3a72] text-white dark:text-slate-200'
        }
    }

    return (
        <div className="my-8">
            <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 min-h-[764px]">
                <div className={`${getHeaderColors()} py-4 px-6`}>
                    <div className="h-7 w-48 bg-white/30 rounded mx-auto animate-pulse"></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const HotOrSale = ({ id, title, type }: {
    id: string,
    title: string,
    type: string
}) => {
    const [data, setData] = useState<IProducts | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const query = GET_HOT_OR_DEALS_PRODUCTS

                let filters: ({ [key: string]: object }) = {}
                let sort: string = 'createdAt:desc'
                let sortedBy: string = ''

                switch (type) {
                    case 'hot':
                        filters = { is_hot: { eq: true } }
                        break;
                    case 'new':
                        filters = {}
                        sortedBy = "createdAt:desc"
                        break;
                    case 'sale':
                        filters = { and: [{ is_sale: { eq: true } }, { not: { sale_price: { eq: null } } }] }
                        break;
                    default:
                        break;
                }

                const sorted = sortedBy ? [sortedBy] : [sort]
                const response = await fetcher({ query, variables: { filters, sort: sorted } })
                const result = await response as IProducts
                setData(result)
            } catch (err) {
                console.error("Error fetching products:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [type])

    const getHeaderColors = () => {
        switch (type) {
            case 'hot':
                return 'bg-[#a9488e] dark:bg-gradient-to-br dark:from-[#5a2349] dark:to-[#8c3a75] text-white dark:text-slate-200'
            case 'new':
                return 'bg-[#246eb5] dark:bg-gradient-to-br dark:from-[#153a61] dark:to-[#1e5a95] text-white dark:text-slate-200'
            case 'sale':
                return 'bg-[#6e276f] dark:bg-gradient-to-br dark:from-[#3d183e] dark:to-[#5a205b] text-white dark:text-slate-200'
            default:
                return 'bg-[#24488f] dark:bg-gradient-to-br dark:from-[#132247] dark:to-[#1d3a72] text-white dark:text-slate-200'
        }
    }

    // If loading, return the skeleton with exact same structure
    if (loading) {
        return <HotOrSaleSkeleton type={type} />
    }

    // Always maintain the same layout structure
    return (
        <section key={id} className="my-8">
            <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 min-h-[764px]">
                {/* Header - always visible */}
                <div className={`${getHeaderColors()} py-4 px-6`}>
                    <h2 className="text-center  text-xl md:text-2xl font-bold">
                        {title}
                    </h2>
                </div>

                {/* Content area - smooth transitions */}
                <div className="bg-white h-full dark:bg-slate-800 p-4 transition-opacity duration-300">
                    {error ? (
                        <div className="flex items-center justify-center h-[600px]">
                            <div className="text-center text-gray-500">
                                <p className="text-lg mb-2">⚠️ Failed to load products</p>
                                <p className="text-sm">Please try refreshing the page</p>
                            </div>
                        </div>
                    ) : !data?.products || data.products.data.length === 0 ? (
                        <div className="flex items-center justify-center h-[600px]">
                            <p className="text-gray-500 text-lg">No products available at the moment</p>
                        </div>
                    ) : (
                        <Carousel products={data.products} />
                    )}
                </div>
            </div>
        </section>
    )
}

export default HotOrSale