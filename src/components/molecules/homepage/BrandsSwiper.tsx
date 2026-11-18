// components/molecules/homepage/BrandsSwiper.tsx
//
// Τα brands της αρχικής σε οριζόντια γραμμή (χωρίς Swiper — το όνομα του
// αρχείου έμεινε από την παλιά έκδοση). Server component.
import Image from 'next/image'
import Link from 'next/link'
import ScrollRow from '@/components/atoms/ScrollRow'

interface ProcessedBrand {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  logoAlt: string
}

export default function BrandsSwiper({ brands, label }: { brands: ProcessedBrand[]; label?: string }) {
  if (!brands?.length) return null

  return (
    <ScrollRow label={label} className="gap-6 sm:gap-8 px-2">
      {brands.map(brand => (
        <Link
          key={brand.id}
          href={`/brands/${brand.slug}`}
          prefetch={false}
          aria-label={`Προϊόντα ${brand.name}`}
          className="group snap-start shrink-0 relative h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
          {brand.logoUrl ? (
            <Image
              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              height={112}
              width={112}
              src={brand.logoUrl}
              alt={brand.logoAlt}
              quality={80}
              loading="lazy"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-500">{brand.name}</span>
          )}
        </Link>
      ))}
    </ScrollRow>
  )
}
