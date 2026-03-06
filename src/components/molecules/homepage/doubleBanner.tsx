import NextImage from "@/components/atoms/nextImage";
import { IHomeDoubleBanner } from "@/lib/queries/homepage";
import { TrackableLink } from "@/components/atoms/TrackableLink";

const DoubleBanner = ({ 
    id,
    rightBanner,
    rightHref,
    rightTarget,
    leftBanner,
    leftHref,
    leftTarget 
}: IHomeDoubleBanner) => {
    return (
        <div className='grid h-64 md:grid-cols-2 gap-4'>
            <TrackableLink
                href={rightHref}
                target={rightTarget}
                className="block h-full"
                bannerId={`double_banner_right_${id}`}
                bannerName={rightBanner?.alternativeText || 'Right Banner'}
                bannerPosition="homepage_double_banner_right"
                bannerType="double"
            >
                <NextImage 
                    media={rightBanner} 
                    height={360} 
                    width={720}
                    sizes="(max-width: 768px) 100vw, 50vw"  // 🔑 mobile: full width, desktop: half
                />
            </TrackableLink>
            
            <TrackableLink
                href={leftHref}
                target={leftTarget}
                className="block h-full"
                bannerId={`double_banner_left_${id}`}
                bannerName={leftBanner?.alternativeText || 'Left Banner'}
                bannerPosition="homepage_double_banner_left"
                bannerType="double"
            >
                <NextImage 
                    media={leftBanner} 
                    height={360} 
                    width={720}
                    sizes="(max-width: 768px) 100vw, 50vw"  // 🔑
                />
            </TrackableLink>
        </div>
    )
}

export default DoubleBanner;