import NextImage from "@/components/atoms/nextImage";
import Link from "next/link";

const DoubleBanner = ({ id, rightBanner,
    rightHref,
    rightTarget,
    leftBanner,
    leftHref,
    leftTarget }: { id: string,
        rightBanner:{data: {
            attributes: {
              url: string
              alternativeText: string
            }
          }},
        rightHref: string,
        rightTarget: string,
        leftBanner:{
            data: {
                attributes: {
                  url: string
                  alternativeText: string
                }
              }
        },
        leftHref: string,
        leftTarget: string }) => {
        
    return (
        <div key={id} className='grid md:grid-cols-2 gap-4'>
            <Link href={rightHref} target={rightTarget}>
                <NextImage media={rightBanner.data.attributes} height={360} width={720} />
            </Link>
            <Link href={leftHref} target={leftTarget}>
                <NextImage media={leftBanner.data.attributes} height={360} width={720} />
            </Link>
        </div>
    )
}

export default DoubleBanner;