'use client'

import HeroCarousel from "@/components/molecules/homepage/heroCarousel";
import ResponsiveImage from "@/components/molecules/homepage/responsiveImage";
import { IHeroSlide } from "@/lib/queries/homepage";
import { TrackableLink } from "@/components/atoms/TrackableLink";

interface HeroBannersProps {
  slides: IHeroSlide[];
  layout?: 'full' | 'split';
  autoplaySeconds?: number;
  priority?: boolean;
}

const HeroBanners = ({ slides, layout = 'full', autoplaySeconds = 5, priority = false }: HeroBannersProps) => {
  const autoplayDelay = Math.max(autoplaySeconds, 2) * 1000

  // «split»: τα 2 τελευταία slides μένουν σταθερά δεξιά
  if (layout === 'split' && slides.length >= 3) {
    const mainSlides = slides.slice(0, -2);
    const sideSlides = slides.slice(-2);

    return (
      <section className="w-full my-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[500px]">

          <div className="lg:col-span-8 h-full">
            <div className="aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:h-full rounded-xl overflow-hidden">
              <HeroCarousel
                carousel={mainSlides}
                className="h-full"
                autoplayDelay={autoplayDelay}
                trackingLocation="homepage_hero_main"
                priority={priority}
              />
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:h-full">
            {sideSlides.map((slide, index) => {
              const alt = slide.image.alternativeText || slide.title || slide.link_label || `Banner ${index + 1}`
              // (2026-10-28) Τα πλαϊνά banners είναι κι αυτά στο πάνω μέρος → φορτώνουν αμέσως (eager)
              const content = (
                <>
                  <ResponsiveImage
                    image={slide.image}
                    mobileImage={slide.mobile_image}
                    alt={alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    eager={priority}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {slide.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-semibold text-sm lg:text-base">
                        {slide.title}
                      </h3>
                    </div>
                  )}
                </>
              )
              const boxClass = "relative aspect-[16/9] lg:aspect-auto lg:h-full rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 block"

              if (!slide.href) {
                return <div key={slide.id || index} className={boxClass}>{content}</div>
              }

              return (
                <TrackableLink
                  key={slide.id || index}
                  href={slide.href}
                  target={slide.open_in_new_tab ? '_blank' : undefined}
                  className={boxClass}
                  bannerId={`side_banner_${slide.id}`}
                  bannerName={slide.title || slide.link_label || `Side Banner ${index + 1}`}
                  bannerPosition={`homepage_hero_side_${index}`}
                  bannerType="side"
                >
                  {content}
                </TrackableLink>
              )
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full my-4">
      <div className="aspect-[16/9] sm:aspect-[21/9] md:aspect-[5/2] lg:aspect-[16/5] xl:aspect-[16/5] rounded-xl overflow-hidden">
        <HeroCarousel
          carousel={slides}
          className="h-full"
          autoplayDelay={autoplayDelay}
          trackingLocation="homepage_hero_full"
          priority={priority}
        />
      </div>
    </section>
  );
};

export default HeroBanners;
