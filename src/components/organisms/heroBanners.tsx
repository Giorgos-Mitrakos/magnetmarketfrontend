// components/organisms/homepage/heroBanners.tsx
import HeroCarousel from "../molecules/homepage/heroCarousel";
import { IHeroCarouselBanner } from "@/lib/queries/homepage";
import Link from "next/link";
import Image from "next/image";
import { getStrapiMedia } from "@/repositories/medias";

interface HeroBannersProps {
  Banner: IHeroCarouselBanner[];
  layout?: 'full' | 'split'; // Επιλογή layout
}

const HeroBanners = ({ Banner, layout = 'full' }: HeroBannersProps) => {
  
  // Split layout: Πρώτα 3+ banners χωρίζονται σε main carousel και 2 static
  if (layout === 'split' && Banner.length >= 3) {
    const mainBanners = Banner.slice(0, -2); // Όλα εκτός των 2 τελευταίων
    const sideBanners = Banner.slice(-2); // Τα 2 τελευταία

    return (
      <section className="w-full my-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[500px]">
          
          {/* Main Carousel - 70% width σε desktop */}
          <div className="lg:col-span-8 h-full">
            <div className="
              aspect-[16/9]
              sm:aspect-[21/9]
              lg:aspect-auto
              lg:h-full
              rounded-xl 
              overflow-hidden
            ">
              <HeroCarousel 
                carousel={mainBanners} 
                className="h-full"
                autoplayDelay={4000}
              />
            </div>
          </div>

          {/* Side Banners - 30% width σε desktop */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:h-full">
            {sideBanners.map((banner, index) => (
              <Link
                key={banner.id || index}
                href={banner.href}
                className="
                  relative 
                  aspect-[16/9]
                  lg:aspect-auto
                  lg:h-full
                  rounded-xl 
                  overflow-hidden 
                  group
                  shadow-lg
                  hover:shadow-2xl
                  transition-all
                  duration-300
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-blue-500
                "
              >
                <Image
                  src={getStrapiMedia(banner.image.url) || '/placeholder-image.jpg'}
                  alt={banner.image.alternativeText || banner.link_label || `Banner ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  quality={85}
                />
                
                {/* Optional: Overlay με τίτλο */}
                {banner.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-semibold text-sm lg:text-base">
                      {banner.title}
                    </h3>
                  </div>
                )}
              </Link>
            ))}
          </div>

        </div>
      </section>
    );
  }

  // Full Layout (Default) - Ένα μεγάλο carousel
  return (
    <section className="w-full my-4">
      <div className="
        aspect-[16/9]
        sm:aspect-[21/9]
        md:aspect-[5/2]
        lg:aspect-[16/5]
        xl:aspect-[16/5]
        rounded-xl 
        overflow-hidden
      ">
        <HeroCarousel carousel={Banner} className="h-full" />
      </div>
    </section>
  );
};

export default HeroBanners;