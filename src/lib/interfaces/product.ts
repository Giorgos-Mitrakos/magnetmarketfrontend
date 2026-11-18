import { IImageAttr, IImageFormats, TadditionalImages, Timage } from "./image"
import { ProductStatus } from '@/lib/helpers/availabilityHelper';

interface ISeoAttr {
    metaTitle: string
    metaDescription: string
    metaImage: { data: IImageAttr }
    metaSocial: {
        socialNetwork: string
        title: string
        description: string
        image: { data: IImageAttr }
    }
    keywords: string
    metaRobots: string
    structuredData: string
}

export interface ISeo {
    seo: ISeoAttr[]
}

export interface IProdCharAttr {
    id: number
    name: string
    value: string
}

export interface IProdChar {
    prod_chars: IProdCharAttr[]
}

interface ISupplierAttr {
    name: string
    wholesale: number
    in_stock: boolean
}

export interface ISupplier {
    supplierInfo: ISupplierAttr[]
}

export interface IProductBrandAttr {
    name: string
    slug: string
    logo: IImageAttr
}

export interface IProductBrand {
    brand: {
        data: {
            id: number
            attributes: IProductBrandAttr
        }
    }
}

export interface IProductAttr {
    name: string
    slug: string
    sku: string
    mpn: string
    barcode: string
    description: string
    short_description: string
    price: number
    sale_price: number
    is_sale: boolean
    is_hot: boolean
    inventory: number
    is_in_house: boolean
    status: ProductStatus
    weight: number
    height: number
    width: number
    length: number
    publishedAt: Date
    // brand: IProductBrand
    // image: { data: IImageAttr }
    // additionalImages: { data: IImageAttr[] }
}

export interface IProductCategory {
    category: {
        data: {
            id: number
            attributes: {
                name: string
                slug: string
                filters: {
                    name: string
                }[]
                parents: {
                    data: {
                        id: number
                        attributes: {
                            name: string
                            slug: string
                            parents: {
                                data: {
                                    id: number
                                    attributes: {
                                        name: string
                                        slug: string
                                    }
                                }[]
                            }
                        }
                    }[]
                }
            }
        }
    }
}

export interface IProduct {
    id: number
    attributes: TProductAttr
}

export interface IProducts {
    products: {
        data: IProduct[]
    }
}

export interface IProductPriceProps {
    product: {
        data: {
            attributes: {
                price: number
                sale_price: number
                is_hot: boolean
                is_sale: boolean
                status: ProductStatus
                is_in_house: boolean
                inventory: number
            }
        }
    }
}


export type TProductAttr = IProductAttr & Timage & TadditionalImages
    & IProductBrand & IProdChar & IProductCategory & ISeo & ISupplier

export interface IProductPage {
    id: number
    /** (2026-10-27) Καταργήθηκε: η σελίδα μένει με «δεν διατίθεται πια» + εναλλακτικές */
    discontinued?: boolean
    documentId?: string
    name: string
    slug: string
    mpn: string
    barcode: string
    description: string
    short_description: string
    price: number
    sale_price: number
    is_sale: boolean
    /** Λήξη προσφοράς (ISO) — για αντίστροφη μέτρηση */
    sale_ends_at?: string | null
    is_hot: boolean
    inventory: number
    is_in_house: boolean
    status: ProductStatus
    weight: number
    height: number
    width: number
    length: number
    category: {
        id: number
        name: string
        slug: string
        cross_categories: {
            id: number
            name: string
            slug: string
            image: {
                name: string
                alternativeText: string
                caption: string
                width: string
                height: string
                hash: string
                ext: string
                mime: string
                size: string
                url: string
                formats: IImageFormats
            }
            parents: {
                id: number
                name: string
                slug: string
                parents: {
                    id: number
                    name: string
                    slug: string
                }[]
            }[]
        }[]
        parents: {
            id: number
            name: string
            slug: string
            parents: {
                id: number
                name: string
                slug: string
            }[]
        }[]
    }
    image: {
        name: string
        alternativeText: string
        caption: string
        width: string
        height: string
        hash: string
        ext: string
        mime: string
        size: string
        url: string
        formats: IImageFormats
    }
    additionalImages: {
        name: string
        alternativeText: string
        caption: string
        width: string
        height: string
        hash: string
        ext: string
        mime: string
        size: string
        url: string
        formats: IImageFormats
    }[]
    brand: IProductBrandAttr
    prod_chars: IProdCharAttr[]
    /** (2026-10-22) SEO από τον Product Manager */
    seo?: IProductSeo | null
    /** Αρχεία (εγχειρίδια, φυλλάδια) */
    files?: { id: number, name: string | null, url: string }[]
    /** (2026-10-23) Video YouTube/Vimeo — κενό όταν ο διακόπτης είναι κλειστός */
    videos?: IProductVideo[]
    /** Σημείωση για την επαναφορά αποθέματος («Αναμένεται» / «Κατόπιν παραγγελίας») */
    expected_restock_note?: string | null
    /** Χαμηλότερη τιμή 30 ημερών πριν την προσφορά (Omnibus) — μόνο σε προσφορά */
    lowest30BeforeSale?: number | null
    updatedAt?: string
}

export interface IProductSeo {
    metaTitle: string | null
    metaDescription: string | null
    metaImage: { url: string } | null
    keywords: string | null
    metaRobots: string | null
    canonicalURL: string | null
}

/** Badge προϊόντος από το admin (Strapi → Badges): Hot, Exclusive κ.λπ. */
export interface IProductBadge {
    name: string
    slug: string
    color: string | null
    text_color: string | null
    icon: string | null
}

export interface IProductCard {
    id: number
    documentId?: string
    name: string
    slug: string
    mpn: string
    barcode: string
    price: number
    sale_price: number
    is_sale: boolean
    /** Λήξη προσφοράς (ISO) — μόνο όταν η προσφορά είναι ενεργή· για αντίστροφη μέτρηση */
    sale_ends_at?: string | null
    /** «Ήταν Χ€»: έπεσε η τιμή χωρίς προσφορά (χαμηλότερη τιμή 30 ημερών — Omnibus) */
    previous_price?: number | null
    is_hot: boolean
    /** Αυτόματο: δημιουργήθηκε πρόσφατα (PRODUCT_NEW_DAYS στο Strapi) */
    is_new?: boolean
    badges?: IProductBadge[]
    inventory: number
    is_in_house: boolean
    status: ProductStatus
    weight: number
    category: {
        id: number
        name: string
        slug: string
        parents: {
            id: number
            name: string
            slug: string
            parents: {
                id: number
                name: string
                slug: string
            }[]
        }[]
    }
    image: {
        name: string
        alternativeText: string
        caption: string
        width: string
        height: string
        hash: string
        ext: string
        mime: string
        size: string
        url: string
        formats: IImageFormats
    }
    additionalImages: {
        name: string
        alternativeText: string
        caption: string
        width: string
        height: string
        hash: string
        ext: string
        mime: string
        size: string
        url: string
        formats: IImageFormats
    }[]
    brand: IProductBrandAttr
}

export interface ISimilarProductPage {
    id: number
    name: string
    slug: string
    price: number
    sale_price: number
    is_sale: boolean
    /** «Ήταν Χ€» (έπεσε η τιμή χωρίς προσφορά) */
    previous_price?: number | null
    is_hot: boolean
    inventory: number
    is_in_house: boolean
    status: string
    image: {
        name: string
        alternativeText: string
        caption: string
        width: string
        height: string
        hash: string
        ext: string
        mime: string
        size: string
        url: string
        formats: IImageFormats
    }
}

/** (2026-10-23) Αξιολογήσεις (api/product-review) */
export interface IReviewSummary {
    count: number
    average: number | null
    distribution: Record<'1' | '2' | '3' | '4' | '5', number>
}

export interface IProductReview {
    id: string
    name: string
    rating: number
    title: string | null
    body: string | null
    date: string | null
    verified: boolean
    reply: string | null
    replyAt: string | null
}

export interface IProductReviews {
    summary: IReviewSummary
    results: IProductReview[]
    pagination: { page: number; pageSize: number; total: number; pageCount: number }
}

/** (2026-10-23) Δημόσια ερώτηση & απάντηση (src/storefront/qa.ts) */
export interface IProductQa {
    id: string
    question: string
    answer: string
    name: string
    askedAt: string
    answeredAt: string | null
}

/** (2026-10-23) Πακέτο «Αγοράστε τα μαζί» (src/storefront/bundles.ts) */
export interface IProductBundle {
    documentId: string
    name: string
    percent: number
    items: { product: IProductCard; quantity: number; unitPrice: number }[]
    total: number
    saving: number
    bundlePrice: number
}

export interface IProductVideo {
    provider: 'youtube' | 'vimeo'
    id: string
    title: string | null
    url: string
    embedUrl: string
    thumbnail: string | null
    addedAt: string | null
}

export interface IDeliveryWindow {
    /** YYYY-MM-DD */
    from: string
    to: string
}

/** (2026-10-23) Εκτιμώμενη παράδοση (src/storefront/delivery.ts) */
export interface IDeliveryEstimate extends IDeliveryWindow {
    shipsToday: boolean
    /** ISO — έως πότε φεύγει σήμερα */
    cutoffAt: string | null
    shipDate: string
    source: 'stock' | 'supplier'
    /** Η εκτίμηση όταν χαθεί η ώρα αποκοπής */
    next: (IDeliveryWindow & { shipDate: string }) | null
}

/** (2026-10-23) Διακόπτες λειτουργιών (Product Manager → Ρυθμίσεις) */
export interface IStoreFeatures {
    deliveryEstimate: boolean
    productVideos: boolean
    bundles: boolean
    publicQa: boolean
    reviews: boolean
    compare: boolean
    [key: string]: unknown
}

export type TProductPage = { product: IProductPage } & {
    similarProducts: ISimilarProductPage[]
    delivery?: IDeliveryEstimate | null
    features?: IStoreFeatures
    /** (2026-10-26) Αυτόματος τίτλος / περιγραφή από το πρότυπο της κατηγορίας (Strapi) */
    autoSeo?: { title: string; description: string } | null
    bundles?: IProductBundle[]
    qa?: IProductQa[]
    reviews?: IProductReviews | null
    /** «Συχνά αγοράζονται μαζί» (cross-selling) */
    crossSell?: IProductCard[]
    /** Ιστορικό τιμής (μόνο πραγματικές τιμές, όταν υπάρχουν ≥ 30 μέρες καταγραφής) */
    priceHistory?: IPriceHistory | null
}

export interface IPriceHistory {
    since: string
    points: { at: string; price: number }[]
    lowest: number
    highest: number
    /** Χαμηλότερη τιμή των τελευταίων 30 ημερών */
    lowest30: number | null
}

