// Server Component (main wrapper)
import { getStrapiMedia } from "@/repositories/medias"
import { IHomeCategory } from '@/lib/queries/homepage'
import CategoriesSwiper from './CategoriesSwiper'

// Το link (/category/κατ1/κατ2/κατ3) έρχεται έτοιμο από το backend
function processCategories(categories: IHomeCategory[]) {
  return categories.map(cat => ({
    id: String(cat.id),
    name: cat.name,
    link: cat.link,
    imageUrl: cat.image
      ? getStrapiMedia(cat.image.formats?.thumbnail?.url || cat.image.url)
      : null,
    imageAlt: cat.image?.alternativeText || cat.name
  }))
}

// Main Server Component
export default function CategoriesBanner({ id, title = 'Κατηγορίες', categories }: { id: string; title?: string; categories: IHomeCategory[] }) {
  if (!categories || categories.length === 0) {
    return null
  }

  const processedCategories = processCategories(categories)

  return (
    <section 
      key={id} 
      className="w-full py-10 bg-gradient-to-br from-siteColors-lightblue/95 via-siteColors-blue to-siteColors-lightblue/95 dark:from-siteColors-purple/95 dark:via-siteColors-pink dark:to-siteColors-purple/95 rounded-2xl shadow-xl overflow-hidden relative"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYw IE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-center mb-6 text-white dark:text-slate-100 text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md">
          {title}
        </h2>

        <CategoriesSwiper categories={processedCategories} label={title} />
      </div>
    </section>
  )
}