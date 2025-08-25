'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';
import Link from 'next/link';
import { Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import { IBrandsData } from '@/lib/interfaces/brands';

const BrandsBanner = ({ id, brands }: {
    id: string,
    brands: IBrandsData,
}) => {

    return (
        <section key={id} className="w-full py-16 px-4 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
            <div className="mx-auto">
                <h2 className="text-center text-siteColors-purple mb-12 dark:text-slate-200 text-3xl md:text-4xl font-bold">
                    Our Brands
                </h2>
                
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <Swiper
                        className="brands-swiper"
                        breakpoints={{
                            0: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            480: {
                                slidesPerView: 3,
                                spaceBetween: 25,
                            },
                            640: {
                                slidesPerView: 4,
                                spaceBetween: 25,
                            },
                            768: {
                                slidesPerView: 5,
                                spaceBetween: 30,
                            },
                            1024: {
                                slidesPerView: 6,
                                spaceBetween: 30,
                            },
                            1280: {
                                slidesPerView: 7,
                                spaceBetween: 35,
                            },
                            1536: {
                                slidesPerView: 8,
                                spaceBetween: 35,
                            },
                        }}
                        navigation={{
                            nextEl: '.brands-swiper-next',
                            prevEl: '.brands-swiper-prev',
                        }}
                        autoplay={{
                            delay: 2000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={true}
                        modules={[Autoplay, Navigation]}
                        speed={800}
                    >
                        {brands.data && brands.data.length > 0 &&
                            brands.data.map(brand => (brand.attributes.logo.data &&
                                <SwiperSlide key={brand.id} className="flex items-center justify-center">
                                    <Link 
                                        href={`/brands/${brand.attributes.slug}`}
                                        aria-label={`Link σε προϊόντα του κατασκευάστή ${brand.attributes.name}`}
                                        className="relative h-28 w-28 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                                    >
                                        {brand.attributes.logo.data.attributes.formats ?
                                            <Image
                                                className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                                height={112}
                                                width={112}
                                                src={getStrapiMedia(brand.attributes.logo.data.attributes.formats.thumbnail.url)}
                                                alt={brand.attributes.logo.data.attributes.alternativeText || brand.attributes.name}
                                                quality={80}
                                                blurDataURL={getStrapiMedia(brand.attributes.logo.data.attributes.formats.thumbnail.url)}
                                                placeholder="blur"
                                            />
                                            :
                                            <Image
                                                className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                                height={112}
                                                width={112}
                                                src={getStrapiMedia(brand.attributes.logo.data.attributes.url)}
                                                alt={brand.attributes.logo.data.attributes.alternativeText || brand.attributes.name}
                                                quality={80}
                                                blurDataURL={getStrapiMedia(brand.attributes.logo.data.attributes.url)}
                                                placeholder="blur"
                                            />
                                        }
                                    </Link>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                    
                    {/* Custom navigation buttons */}
                    <button className="brands-swiper-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-siteColors-purple hover:text-white transition-colors duration-300 border border-slate-200 dark:border-slate-600">
                        &lt;
                    </button>
                    <button className="brands-swiper-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-siteColors-purple hover:text-white transition-colors duration-300 border border-slate-200 dark:border-slate-600">
                        &gt;
                    </button>
                </div>
                
                <div className="text-center mt-12">
                    <Link 
                        href="/brands" 
                        className="inline-block px-8 py-3 bg-siteColors-purple text-white rounded-full hover:bg-opacity-90 transition-colors duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                        View All Brands
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default BrandsBanner;