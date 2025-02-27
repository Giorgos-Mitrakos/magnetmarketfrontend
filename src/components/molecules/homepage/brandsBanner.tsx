import { IimageProps } from '@/lib/queries/categoryQuery';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegImage } from 'react-icons/fa6';

const BrandsBanner = async ({ id, brands }: {
    id: string,
    brands: {
        data: {
            id: string
            attributes: {
                name: string
                slug: string
                logo: {
                    data: {
                        attributes: {
                            url: string
                            name: string,
                            alternativeText: string
                            formats: {
                                thumbnail: IimageProps,
                                small: IimageProps
                            }
                        }
                    }
                }
            }
        }[]
    },
}) => {

    return (
        <section key={id} className='w-full h-60 py-8'>
            <h2 className="text-center text-siteColors-purple dark:text-slate-200 xs:text-2xl md:text-3xl font-bold">Brands</h2>
            <div className='flex h-32 items-center space-x-4 w-full overflow-x-auto mt-4 p-4 bg-slate-200 rounded-md'>
                {brands.data && brands.data.length > 0 &&
                    brands.data.map(brand => (brand.attributes.logo.data &&
                        <div key={brand.id} className='shrink-0'>
                            <Link href={`/brands/${brand.attributes.slug}`}
                                aria-label={`Link σε προϊόντα του κατασκευάστή ${brand.attributes.name}`}>
                                {brand.attributes.logo.data.attributes.formats ?
                                    <Image
                                        // className='opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 ease-in-out'
                                        className='object-contain'
                                        // fill
                                        height={36}
                                        width={96}
                                        src={getStrapiMedia(brand.attributes.logo.data.attributes.formats.thumbnail.url)}
                                        alt={brand.attributes.logo.data.attributes.alternativeText}
                                        quality={75}
                                        aria-label={brand.attributes.logo.data.attributes.alternativeText || ""}
                                        blurDataURL={getStrapiMedia(brand.attributes.logo.data.attributes.formats.thumbnail.url)}
                                        placeholder="blur"
                                    />
                                    :
                                    <Image
                                        // className='object-contain'
                                        // fill
                                        height={36}
                                        width={96}
                                        src={getStrapiMedia(brand.attributes.logo.data.attributes.url)}
                                        alt={brand.attributes.logo.data.attributes.alternativeText}
                                        quality={75}
                                        aria-label={brand.attributes.logo.data.attributes.alternativeText || ""}
                                        blurDataURL={getStrapiMedia(brand.attributes.logo.data.attributes.url)}
                                        placeholder="blur"
                                    />
                                    // <NextImage media={brand.attributes.logo.data.attributes} width={240} height={240} />
                                }
                            </Link>
                        </div>
                    ))}
            </div>
        </section >
    )
}

export default BrandsBanner;