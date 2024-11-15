'use client'
import Image from "next/image"
// import HeroCarousel from "../molecules/heroCarousel"
import HeroFixedBanners from "../molecules/homepage/heroFixedBanners"
import dynamic from 'next/dynamic'

const HeroCarousel = dynamic(() => import('../molecules/homepage/heroCarousel'))


const HeroBanners = ({ carousel, fixed_hero_banners }) => {
    return (
        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 my-4">
            <div className="md:col-span-2 h-full w-full">
                <HeroCarousel carousel={carousel} />
            </div>
            <div className="md:col-span-1 h-full">
                <HeroFixedBanners fixed_hero_banners={fixed_hero_banners} />
            </div>
        </section>
    )
}

export default HeroBanners