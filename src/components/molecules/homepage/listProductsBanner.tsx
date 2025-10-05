// Server Component - χωρίς 'use client'
import { Suspense } from 'react'
import Carousel from "@/components/atoms/carousel"
import { IImageAttr } from "@/lib/interfaces/image"
import { IProductBrand } from "@/lib/interfaces/product"
import { ProductCardSkeleton } from '@/components/organisms/productCard'

// Interfaces - ίδια όπως πριν
interface Product {
  id: number
  attributes: {
    name: string
    slug: string
    mpn: string
    barcode: string
    price: number
    sale_price: number
    is_sale: boolean
    is_hot: boolean
    inventory: number
    is_in_house: boolean
    weight: number
    status: string
    brand: IProductBrand
    image: { data: IImageAttr }
  }
}

interface ListProductsBannerProps {
  id: string
  title: string
  subtitle?: string
  products: Product[]
  loading?: boolean
}

// Server Component για Skeleton
function ListProductsBannerSkeleton() {
  return (
    <section className="my-8 pb-10 rounded-xl bg-gradient-to-br from-siteColors-purple via-siteColors-pink to-siteColors-lightblue px-4 shadow-lg min-h-[550px] flex items-center">
      <div className="mx-auto w-full py-8">
        <div className="text-center mb-8">
          <div className="h-10 bg-white/30 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-white/30 rounded w-48 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Server Component για Header
function BannerHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="py-2 text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-md">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-white/90 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      ) : (
        <div className="h-6" />
      )}
    </div>
  )
}

// Server Component για Empty State
function EmptyState() {
  return (
    <div className="text-center py-12 bg-white/20 rounded-lg">
      <p className="text-white text-xl">Δεν βρέθηκαν προϊόντα</p>
      <p className="text-white/80 mt-2">Ελέγξτε ξανά αργότερα</p>
    </div>
  )
}

// Main Server Component
export default function ListProductsBanner({
  id,
  title,
  subtitle,
  products,
  loading = false
}: ListProductsBannerProps) {
  
  // Server-side logic - χωρίς state και effects
  const hasProducts = products && products.length > 0
  
  // Αν loading, δείξε skeleton
  if (loading || !products) {
    return <ListProductsBannerSkeleton />
  }

  return (
    <section
      id={id}
      className="my-8 rounded-xl bg-gradient-to-br from-siteColors-purple via-siteColors-pink dark:via-siteColors-blue to-siteColors-lightblue dark:to-siteColors-purple px-4 shadow-lg min-h-[550px] flex items-center"
    >
      <div className="mx-auto w-full py-8">
        <BannerHeader title={title} subtitle={subtitle} />
        
        {hasProducts ? (
          <Suspense fallback={<ListProductsBannerSkeleton />}>
            <Carousel products={products} />
          </Suspense>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  )
}