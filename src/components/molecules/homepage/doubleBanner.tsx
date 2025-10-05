import NextImage from "@/components/atoms/nextImage";
import { IHomeDoubleBanner } from "@/lib/queries/homepage";
import Link from "next/link";

const DoubleBanner = ({ id, rightBanner,
    rightHref,
    rightTarget,
    leftBanner,
    leftHref,
    leftTarget }: IHomeDoubleBanner) => {

    return (
        <div className='grid h-64 md:grid-cols-2 gap-4'>
            <Link href={rightHref} target={rightTarget}>
                <NextImage media={rightBanner} height={360} width={720} />
            </Link>
            <Link href={leftHref} target={leftTarget}>
                <NextImage media={leftBanner} height={360} width={720} />
            </Link>
        </div>
    )
}

export default DoubleBanner;