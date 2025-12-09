import NextImage from "@/components/atoms/nextImage";
import { IHomeSingleBanner } from "@/lib/queries/homepage";
import { TrackableLink } from "@/components/atoms/TrackableLink"; // ✅ Import

const SingleBanner = ({ 
    id,
    singleBanner,
    href,
    target 
}: IHomeSingleBanner) => {
    return (
        <div className='flex w-full'>
            {singleBanner && (
                <TrackableLink
                    href={href}
                    target={target}
                    className="block w-full"
                    bannerId={`single_banner_${id}`}
                    bannerName={singleBanner?.alternativeText || 'Single Banner'}
                    bannerPosition="homepage_single_banner"
                    bannerType="single"
                >
                    <NextImage media={singleBanner} height={768} width={1536} />
                </TrackableLink>
            )}
        </div>
    )
}

export default SingleBanner