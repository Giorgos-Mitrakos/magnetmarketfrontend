// Εικόνα banner με προαιρετική ξεχωριστή εικόνα για κινητό.
// Χωρίς mobile_image → η ίδια εικόνα παντού.
// (2026-10-26) Με mobile_image: ένα <picture> (κινητό / από 768px υπολογιστής) αντί για δύο
// <Image> με hidden — πριν ο browser κατέβαζε ΚΑΙ τις δύο εικόνες (και με priority τις
// προφόρτωνε και τις δύο), που καθυστερούσε το πρώτο banner στο κινητό.
import Image, { getImageProps } from 'next/image'
import { getStrapiMedia } from '@/repositories/medias'
import { IMedia } from '@/lib/queries/homepage'

interface Props {
    image: IMedia
    mobileImage?: IMedia | null
    alt: string
    sizes?: string
    priority?: boolean
    /** (2026-10-28) Φόρτωση αμέσως (πάνω μέρος σελίδας) χωρίς προφόρτωση — για δεύτερα banners */
    eager?: boolean
    className?: string
    /** fill: γεμίζει τον γονέα (ο γονέας χρειάζεται relative + ύψος) */
    fill?: boolean
}

const ResponsiveImage = ({ image, mobileImage, alt, sizes, priority = false, eager = false, className = '', fill = false }: Props) => {
    const common = {
        sizes,
        // (2026-10-28) Next.js 16: το priority λέγεται πλέον preload
        preload: priority,
        // (2026-11-24) Η κύρια εικόνα (LCP) με υψηλή προτεραιότητα — το ζητούσε το PageSpeed
        // («fetchpriority=high should be applied to the image preload request»)
        fetchPriority: priority ? ('high' as const) : undefined,
        loading: priority || eager ? ('eager' as const) : ('lazy' as const),
        quality: 85,
    }

    const dims = (m: IMedia) =>
        fill ? { fill: true as const } : { width: m.width || 1536, height: m.height || 768 }
    const sizeClass = fill ? '' : 'w-full h-auto'

    if (!mobileImage) {
        return (
            <Image
                {...common}
                {...dims(image)}
                alt={alt}
                src={getStrapiMedia(image.url)!}
                className={`${sizeClass} ${className}`}
            />
        )
    }

    const { props: { srcSet: desktopSrcSet, sizes: desktopSizes } } = getImageProps({
        ...common,
        ...dims(image),
        alt,
        src: getStrapiMedia(image.url)!,
    })
    const { props: mobileProps } = getImageProps({
        ...common,
        ...dims(mobileImage),
        alt,
        src: getStrapiMedia(mobileImage.url)!,
    })

    return (
        <picture className={fill ? 'contents' : 'block'}>
            <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes={desktopSizes} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...mobileProps} className={`${sizeClass} ${className}`} />
        </picture>
    )
}

export default ResponsiveImage
