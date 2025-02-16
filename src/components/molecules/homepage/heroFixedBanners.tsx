import Link from 'next/link';
import NextImage from '../../atoms/nextImage';
import { ICarousel, IFixedHeroBanners } from '@/lib/queries/homepage';
import Image from 'next/image';
import { getStrapiMedia } from '@/repositories/medias';

const HeroFixedBanners = ({ sideBanner }: { sideBanner: ICarousel[] }) => {
    return (
        <div className='flex lg:flex-col gap-4 h-full justify-between'>
            {
                sideBanner.map((banner, i) => (
                    <Link key={i} href={banner.href} className={`cursor-pointer items-center relative w-full h-48`}>
                        {/* <NextImage media={banner.image.data.attributes} height={200} width={435} /> */}
                        <Image
                            // layout='responsive'
                            className="object-contain bg-white"
                            // width={356}
                            // height={192}
                            fill
                            src={getStrapiMedia(banner.image.data.attributes.url)}
                            alt={banner.image.data.attributes.alternativeText || ""}
                            quality={75}
                            aria-label={banner.image.data.attributes.alternativeText || ""}
                            blurDataURL={getStrapiMedia(banner.image.data.attributes.url)}
                            placeholder="blur"
                        />
                    </Link>
                ))
            }
        </div>
    );

}

export default HeroFixedBanners