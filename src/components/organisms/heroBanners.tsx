'use client'
import Image from "next/image"
// import HeroCarousel from "../molecules/heroCarousel"
import dynamic from 'next/dynamic'
import { ICarousel, IFixedHeroBanners } from "@/lib/queries/homepage"
import HeroFixedBanners from "../molecules/homepage/heroFixedBanners"

const HeroCarousel = dynamic(() => import('../molecules/homepage/heroCarousel'), { ssr: false })


const HeroBanners = ({ Banner, sideBanner }: { Banner: ICarousel[], sideBanner: ICarousel[] }) => {
    return (
        <section className="flex w-full h-[12rem] sm:h-[18rem] md:h-[25rem] lg:h-[30rem]">
            <div className="h-full w-full">
                <HeroCarousel carousel={Banner} />
            </div>
            {/* <div className="h-full">
                <HeroFixedBanners sideBanner={sideBanner} />
            </div> */}
        </section>
    )
}

export default HeroBanners