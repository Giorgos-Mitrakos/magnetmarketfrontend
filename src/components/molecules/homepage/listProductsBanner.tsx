'use client'

import { useState, useEffect } from 'react'
import Carousel from "@/components/atoms/carousel";
import { IImageAttr } from "@/lib/interfaces/image";
import { IProdChar, IProductBrand } from "@/lib/interfaces/product";
import { ProductCardSkeleton } from '@/components/organisms/productCard';

// Interfaces
interface Product {
  id: number;
  attributes: {
    name: string;
    slug: string;
    prod_chars: IProdChar[];
    brand: {
      data: IProductBrand;
    };
    image: { data: IImageAttr };
  };
}

interface ListProductsBannerProps {
  id: string;
  title: string;
  subtitle?: string;
  products: {
    data: Product[];
  };
  loading?: boolean;
}

// Skeleton Component - EXACT same structure as real component
const ListProductsBannerSkeleton = () => (
  <section className="my-8 pb-10 rounded-xl bg-gradient-to-br from-siteColors-purple via-siteColors-pink to-siteColors-lightblue px-4 shadow-lg min-h-[550px] flex items-center">
    <div className=" mx-auto w-full py-8">
      <div className="text-center mb-8">
        <div className="h-10 bg-white/30 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-white/30 rounded w-48 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(2)].map((_, i) => (
          <ProductCardSkeleton key={i}/>
        ))}
      </div>
    </div>
  </section>
)

const ListProductsBanner = ({ 
  id, 
  title, 
  subtitle, 
  products, 
  loading = false 
}: ListProductsBannerProps) => {

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    setIsMounted(true);
    // Simulate loading if products are empty
    if (!products?.data || products.data.length === 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [products]);

  // If still loading, return the skeleton
  if (!isMounted || isLoading) {
    return <ListProductsBannerSkeleton />;
  }

  // Main component with EXACT same structure as skeleton
  return (
    <section 
      id={id}
      className="my-8 rounded-xl bg-gradient-to-br from-siteColors-purple via-siteColors-pink dark:via-siteColors-blue to-siteColors-lightblue dark:to-siteColors-purple px-4 shadow-lg min-h-[550px] flex items-center"
    >
      <div className=" mx-auto w-full py-8">
        {/* Header - exactly same as skeleton */}
        <div className="text-center mb-8">
          <h2 className="py-2 text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-md">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          ):<div className='h-6'></div>}
        </div>

        {/* Content area */}
        {!products?.data || products.data.length === 0 ? (
          <div className="text-center py-12 bg-white/20 rounded-lg">
            <p className="text-white text-xl">Δεν βρέθηκαν προϊόντα</p>
            <p className="text-white/80 mt-2">Ελέγξτε ξανά αργότερα</p>
          </div>
        ) : (
          <Carousel products={products} />
        )}
      </div>
    </section>
  );
};

export default ListProductsBanner;