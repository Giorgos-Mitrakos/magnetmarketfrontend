import NextImage from "@/components/atoms/nextImage";
import { IHomeTripleBanner } from "@/lib/queries/homepage";
import { TrackableLink } from "@/components/atoms/TrackableLink";

const TripleBanner = ({ 
    id,
    rightTripleBanner,
    rightTripleHref,
    rightTripleTarget,
    middleTripleBanner,
    middleTripleHref,
    middleTripleTarget,
    leftTripleBanner,
    leftTripleHref,
    leftTripleTarget 
}: IHomeTripleBanner) => {
    return (
        <div className='grid md:grid-cols-3 gap-4'>
            <TrackableLink
                href={rightTripleHref}
                target={rightTripleTarget}
                className="block"
                bannerId={`triple_banner_right_${id}`}
                bannerName={rightTripleBanner?.alternativeText || 'Right Banner'}
                bannerPosition="homepage_triple_banner_right"
                bannerType="triple"
            >
                <NextImage 
                    media={rightTripleBanner} 
                    height={256} 
                    width={512}
                    sizes="(max-width: 768px) 100vw, 33vw"  // 🔑 mobile: full width, desktop: 1/3
                />
            </TrackableLink>
            
            <TrackableLink
                href={middleTripleHref}
                target={middleTripleTarget}
                className="block"
                bannerId={`triple_banner_middle_${id}`}
                bannerName={middleTripleBanner?.alternativeText || 'Middle Banner'}
                bannerPosition="homepage_triple_banner_middle"
                bannerType="triple"
            >
                <NextImage 
                    media={middleTripleBanner} 
                    height={256} 
                    width={512}
                    sizes="(max-width: 768px) 100vw, 33vw"  // 🔑
                />
            </TrackableLink>
            
            <TrackableLink
                href={leftTripleHref}
                target={leftTripleTarget}
                className="block"
                bannerId={`triple_banner_left_${id}`}
                bannerName={leftTripleBanner?.alternativeText || 'Left Banner'}
                bannerPosition="homepage_triple_banner_left"
                bannerType="triple"
            >
                <NextImage 
                    media={leftTripleBanner} 
                    height={256} 
                    width={512}
                    sizes="(max-width: 768px) 100vw, 33vw"  // 🔑
                />
            </TrackableLink>
        </div>
    )
}

export default TripleBanner;