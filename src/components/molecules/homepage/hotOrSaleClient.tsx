'use client'
import { memo } from 'react'
import dynamic from "next/dynamic"
import { ProductCardSkeleton } from "@/components/organisms/productCard"
import { IProductCard, IProducts } from "@/lib/interfaces/product"

// Dynamic import του Carousel - ΙΔΙΟ όπως πριν
const Carousel = dynamic(() => import('@/components/atoms/carousel'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
})

interface HotOrSaleClientProps {
  id: string
  title: string
  type: string
  initialData: IProductCard[] | null
}

// Helper function για colors - ΙΔΙΑ όπως πριν
const getHeaderColors = (type: string) => {
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

// Main Client Component - ΙΔΙΑ εμφάνιση
const HotOrSaleClient = memo(({ id, title, type, initialData }: HotOrSaleClientProps) => {
  const headerColorClasses = getHeaderColors(type)
  const hasError = initialData === null
  const hasProducts = initialData && initialData.length > 0

  if (!hasProducts) return null

  return (
    <section key={id} className="my-8">
      <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 min-h-[764px]">
        {/* Header - ίδιο όπως πριν */}
        <div className={`${headerColorClasses} py-4 px-6`}>
          <h2 className="text-center text-xl md:text-2xl font-bold">
            {title}
          </h2>
        </div>

        {/* Content area - ίδιο όπως πριν */}
        <div className="bg-white h-full dark:bg-slate-800 p-4 transition-opacity duration-300">
          {hasError ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">⚠️ Failed to load products</p>
                <p className="text-sm">Please try refreshing the page</p>
              </div>
            </div>
          ) : (
            <Carousel products={initialData} />
          )}
        </div>
      </div>
    </section>
  )
})

HotOrSaleClient.displayName = 'HotOrSaleClient'

export default HotOrSaleClient