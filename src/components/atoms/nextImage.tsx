import { getStrapiMedia } from "@/repositories/medias";
import Image from "next/image"

interface IProps {
  media: {
    url: string
    alternativeText: string
  }
  width: number
  height: number
  priority?: boolean   // 🔑 νέο — για LCP images
  sizes?: string       // 🔑 νέο — για responsive images
  className?: string   // 🔑 νέο — για custom styling
}

const NextImage = ({ media, width, height, priority = false, sizes, className }: IProps) => {
  // 🔑 fix: αν δεν υπάρχει media, επέστρεψε null (όχι recursive call)
  if (!media) {
    return null
  }

  const { url, alternativeText } = media

  return (
    <Image
      className={className || "object-contain"}
      width={width}
      height={height}
      src={getStrapiMedia(url)!}
      alt={alternativeText || ""}
      quality={75}
      aria-label={alternativeText || ""}
      blurDataURL={getStrapiMedia(url)!}
      placeholder="blur"
      priority={priority}                    // 🔑 προσθέτει fetchpriority=high
      loading={priority ? 'eager' : 'lazy'}  // 🔑 αφαιρεί lazy για LCP
      sizes={sizes}                          // 🔑 σωστό responsive μέγεθος
    />
  )
}

export default NextImage