// components/molecules/homepage/CategoriesSwiper.tsx
//
// Οι κατηγορίες της αρχικής σε οριζόντια γραμμή (χωρίς Swiper — το όνομα του
// αρχείου έμεινε από την παλιά έκδοση). Server component: μόνο τα βελάκια του
// ScrollRow τρέχουν στον browser.
import Image from 'next/image'
import Link from 'next/link'
import { FaRegImage } from 'react-icons/fa'
import ScrollRow from '@/components/atoms/ScrollRow'

interface ProcessedCategory {
  id: string
  name: string
  link: string
  imageUrl: string | null
  imageAlt: string
}

export default function CategoriesSwiper({ categories, label }: { categories: ProcessedCategory[]; label?: string }) {
  if (!categories?.length) return null

  return (
    <ScrollRow label={label} arrows="light" className="gap-3 sm:gap-5">
      {categories.map(category => (
        <Link
          key={category.id}
          href={category.link}
          prefetch={false}
          className="group snap-start shrink-0 w-28 sm:w-32 flex flex-col items-center py-2"
        >
          <span className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-3 rounded-full bg-white shadow-lg ring-2 ring-white/50 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
            {category.imageUrl ? (
              <Image
                height={72}
                width={72}
                src={category.imageUrl}
                alt={category.imageAlt}
                quality={80}
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <FaRegImage className="w-10 h-10 text-siteColors-blue/70 dark:text-siteColors-purple/70" />
            )}
          </span>
          <span className="text-center text-white dark:text-slate-100 font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem] px-1">
            {category.name}
          </span>
        </Link>
      ))}
    </ScrollRow>
  )
}
