// Server Component (main wrapper)
import { Suspense } from 'react'
import { getStrapiMedia } from "@/repositories/medias"
import { IHomeCategoriesBanner } from '@/lib/queries/homepage'
import CategoriesSwiper from './CategoriesSwiper'

// Server-side data processing
function processCategories(categories: IHomeCategoriesBanner['categories']) {
  return categories.map(cat => {
    let link = ""
    
    if (cat.parents.length > 0) {
      if (cat.parents[0].parents.length > 0) {
        link = `/category/${cat.parents[0].parents[0].slug}/${cat.parents[0].slug}/${cat.slug}`
      } else {
        link = `/category/${cat.parents[0].slug}/${cat.slug}`
      }
    } else {
      link = `/category/${cat.slug}`
    }

    // Process image URLs server-side για καλύτερη performance
    const imageUrl = cat.image 
      ? getStrapiMedia(cat.image.formats?.thumbnail?.url || cat.image.url)
      : null

    return {
      id: cat.id,
      name: cat.name,
      link,
      imageUrl,
      imageAlt: cat.image?.alternativeText || cat.name
    }
  })
}

// Server Component Skeleton
function CategoriesBannerSkeleton() {
  return (
    <section className="w-full py-10 bg-gradient-to-br from-siteColors-lightblue/95 via-siteColors-blue to-siteColors-lightblue/95 dark:from-siteColors-purple/95 dark:via-siteColors-pink dark:to-siteColors-purple/95 rounded-2xl shadow-xl overflow-hidden relative">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYwIE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="h-10 bg-white/30 rounded-lg w-40 mx-auto mb-8 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col items-center p-4">
              <div className="w-32 h-32 bg-white/30 rounded-full mb-4 animate-pulse ring-2 ring-white/20"></div>
              <div className="h-10 bg-white/30 rounded w-28 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Main Server Component
export default function CategoriesBanner({ id, categories }: IHomeCategoriesBanner) {
  // Server-side processing
  const processedCategories = processCategories(categories)

  if (!categories || categories.length === 0) {
    return <CategoriesBannerSkeleton />
  }

  return (
    <section 
      key={id} 
      className="w-full py-10 bg-gradient-to-br from-siteColors-lightblue/95 via-siteColors-blue to-siteColors-lightblue/95 dark:from-siteColors-purple/95 dark:via-siteColors-pink dark:to-siteColors-purple/95 rounded-2xl shadow-xl overflow-hidden relative"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYw IE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 
          className="text-center mb-8 text-white dark:text-slate-100 text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md"
          aria-label="Κατηγορίες"
        >
          Κατηγορίες
        </h2>

        <Suspense fallback={<CategoriesBannerSkeleton />}>
          <CategoriesSwiper categories={processedCategories} />
        </Suspense>
      </div>
    </section>
  )
}