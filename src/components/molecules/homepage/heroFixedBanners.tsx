import Link from 'next/link';
import NextImage from '../../atoms/nextImage';
import { IFixedHeroBanners } from '@/lib/queries/homepage';

const HeroFixedBanners = ({ fixed_hero_banners }:{fixed_hero_banners:IFixedHeroBanners[]}) => {
    return (
        <div className='flex items-center md:flex-col md:justify-between h-full space-x-4 md:space-x-0 md:space-y-4'>
            {
                fixed_hero_banners.map((banner, i) => (
                    <Link key={i} href={banner.href} className={`cursor-pointer items-center`}>
                        <NextImage media={banner.image.data.attributes} height={480} width={1024} />
                    </Link>
                ))
            }
        </div>
    );

}

export default HeroFixedBanners