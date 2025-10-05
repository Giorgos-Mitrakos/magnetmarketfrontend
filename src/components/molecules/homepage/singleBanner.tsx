import NextImage from "@/components/atoms/nextImage";
import { IHomeSingleBanner } from "@/lib/queries/homepage";
import Link from "next/link";

const SingleBanner = ({ id,
    singleBanner,
    href,
    target }: IHomeSingleBanner) => {

    return (
        <div className='flex w-full'>
            {singleBanner && <Link href={href} target={target}>
                <NextImage media={singleBanner} height={768} width={1536} />
            </Link>}
        </div>
    )
}

export default SingleBanner;