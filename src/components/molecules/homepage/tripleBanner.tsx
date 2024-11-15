import { IcategoryProductsProps } from "@/lib/queries/productQuery";
import Carousel from "../../atoms/carousel";
import NextImage from "@/components/atoms/nextImage";
import Link from "next/link";

const TripleBanner = ({ id, rightTripleBanner,
    rightTripleHref,
    rightTripleTarget,
    middleTripleBanner,
    middleTripleHref,
    middleTripleTarget,
    leftTripleBanner,
    leftTripleHref,
    leftTripleTarget }: {
        id: string,
        rightTripleBanner: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        },
        rightTripleHref: string,
        rightTripleTarget: string,
        middleTripleBanner: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        },
        middleTripleHref: string,
        middleTripleTarget: string,
        leftTripleBanner: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        },
        leftTripleHref: string,
        leftTripleTarget: string
    }) => {


    console.log("rest:", middleTripleBanner.data)
    return (
        <div key={id} className='grid md:grid-cols-3 gap-4'>
            <Link href={rightTripleHref} target={rightTripleTarget}>
                <NextImage media={rightTripleBanner.data.attributes} height={512} width={1024} />
            </Link>
            <Link href={middleTripleHref} target={middleTripleTarget}>
                <NextImage media={middleTripleBanner.data.attributes} height={512} width={1024} />
            </Link>
            <Link href={leftTripleHref} target={leftTripleTarget}>
                <NextImage media={leftTripleBanner.data.attributes} height={512} width={1024} />
            </Link>
        </div>
    )
}

export default TripleBanner;