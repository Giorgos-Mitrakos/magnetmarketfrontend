// import { getStrapiMedia } from "../../../utils/medias"
import { getStrapiMedia } from "@/repositories/medias";
import Image from "next/image"

interface IProps {
  media: {
    url: string
    alternativeText: string
  }
  width: number
  height: number
}

const NextImage = (props: IProps) => {
  if (!props.media) {
    return <NextImage {...props} />
  }

  const { url, alternativeText } = props.media
  const { width, height } = props;

  return (
    <Image
      // layout='responsive'
      className="object-contain"
      width={width}
      height={height}
      src={getStrapiMedia(url)}
      alt={alternativeText || ""}
      quality={75}
      aria-label={alternativeText || ""}
      blurDataURL={getStrapiMedia(url)}
      placeholder="blur"
    />
  )
}

export default NextImage
