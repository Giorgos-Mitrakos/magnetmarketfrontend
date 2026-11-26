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

    const { props: { srcSet: desktopSrcSet, sizes: desktopSizes, src: desktopSrc } } = getImageProps({
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

    // (2026-11-26) Το getImageProps ΔΕΝ βάζει προφόρτωση (το preload/priority ισχύει μόνο στο <Image>).
    // Με ξεχωριστή εικόνα κινητού η κύρια εικόνα (LCP) έμενε χωρίς <link rel="preload"> και ο browser
    // την ανακάλυπτε αργά. Δύο preload με media: κατεβαίνει ΜΟΝΟ αυτό που ταιριάζει στην οθόνη.
    // Το React 19 μεταφέρει τα <link> στο <head>.
    const preloads = priority ? (
        <>
            <link
                rel="preload"
                as="image"
                href={mobileProps.src}
                imageSrcSet={mobileProps.srcSet}
                imageSizes={mobileProps.sizes}
                media="(max-width: 767px)"
                fetchPriority="high"
            />
            <link
                rel="preload"
                as="image"
                href={desktopSrc}
                imageSrcSet={desktopSrcSet}
                imageSizes={desktopSizes}
                media="(min-width: 768px)"
                fetchPriority="high"
            />
        </>
    ) : null

    return (
        <>
        {preloads}
        <picture className={fill ? 'contents' : 'block'}>
            <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes={desktopSizes} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...mobileProps} className={`${sizeClass} ${className}`} />
        </picture>
        </>
    )
}

export default ResponsiveImage
