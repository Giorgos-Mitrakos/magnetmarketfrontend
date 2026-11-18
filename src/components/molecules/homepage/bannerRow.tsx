// Σειρά 1–4 banners (αντικαθιστά τα single / double / triple banner).
import { TrackableLink } from '@/components/atoms/TrackableLink'
import { IBannerItem } from '@/lib/queries/homepage'
import ResponsiveImage from './responsiveImage'

const GRID: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
}

const SIZES: Record<number, string> = {
    1: '100vw',
    2: '(max-width: 768px) 100vw, 50vw',
    3: '(max-width: 768px) 100vw, 33vw',
    4: '(max-width: 768px) 50vw, 25vw',
}

const BannerRow = ({ id, banners, priority = false }: { id: string; banners: IBannerItem[]; priority?: boolean }) => {
    const count = Math.min(Math.max(banners.length, 1), 4)

    return (
        <div id={id} className={`grid gap-4 ${GRID[count]}`}>
            {banners.slice(0, 4).map((banner, index) => {
                const alt = banner.image.alternativeText || banner.title || `Banner ${index + 1}`
                const image = (
                    <ResponsiveImage
                        image={banner.image}
                        mobileImage={banner.mobile_image}
                        alt={alt}
                        sizes={SIZES[count]}
                        priority={priority && index === 0}
                        className="rounded-xl object-contain"
                    />
                )

                if (!banner.href) {
                    return <div key={banner.id}>{image}</div>
                }

                return (
                    <TrackableLink
                        key={banner.id}
                        href={banner.href}
                        target={banner.open_in_new_tab ? '_blank' : undefined}
                        className="block"
                        bannerId={`banner_row_${id}_${banner.id}`}
                        bannerName={banner.title || alt}
                        bannerPosition={`homepage_${id}_${index}`}
                        bannerType="row"
                    >
                        {image}
                    </TrackableLink>
                )
            })}
        </div>
    )
}

export default BannerRow
