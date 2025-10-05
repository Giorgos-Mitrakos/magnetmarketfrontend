// components/organisms/homepage/heroBanners.tsx
import HeroCarousel from "../molecules/homepage/heroCarousel";
import { IHeroCarouselBanner } from "@/lib/queries/homepage";

interface HeroBannersProps {
  Banner: IHeroCarouselBanner[];
}

const HeroBanners = ({ Banner }: HeroBannersProps) => {
  return (
    <section className="w-full mb-10">
      <div className="aspect-[18/5] md:aspect-[4/1] rounded-xl overflow-hidden">
        <HeroCarousel carousel={Banner} className="h-full" />
      </div>
    </section>
  );
};

export default HeroBanners;