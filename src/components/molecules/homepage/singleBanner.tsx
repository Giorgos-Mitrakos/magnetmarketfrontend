import NextImage from "@/components/atoms/nextImage";
import Link from "next/link";

const SingleBanner = ({ id,
    singleBanner,
    href,
    target }: {
        id: string,
        singleBanner: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        },
        href: string,
        target: string
    }) => {

    return (
        <div key={id} className='flex w-full'>
            {singleBanner.data && <Link href={href} target={target}>
                <NextImage media={singleBanner.data.attributes} height={768} width={1536} />
            </Link>}
        </div>
    )
}

export default SingleBanner;