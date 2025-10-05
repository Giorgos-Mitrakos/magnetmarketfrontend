import NextImage from "@/components/atoms/nextImage";
import { IHomeTripleBanner } from "@/lib/queries/homepage";
import Link from "next/link";

const TripleBanner = ({ id, rightTripleBanner,
    rightTripleHref,
    rightTripleTarget,
    middleTripleBanner,
    middleTripleHref,
    middleTripleTarget,
    leftTripleBanner,
    leftTripleHref,
    leftTripleTarget }: IHomeTripleBanner) => {

    return (
        <div className='grid md:grid-cols-3 gap-4'>
            <Link href={rightTripleHref} target={rightTripleTarget}>
                <NextImage media={rightTripleBanner} height={256} width={512} />
            </Link>
            <Link href={middleTripleHref} target={middleTripleTarget}>
                <NextImage media={middleTripleBanner} height={256} width={512} />
            </Link>
            <Link href={leftTripleHref} target={leftTripleTarget}>
                <NextImage media={leftTripleBanner} height={256} width={512} />
            </Link>
        </div>
    )
}

export default TripleBanner;