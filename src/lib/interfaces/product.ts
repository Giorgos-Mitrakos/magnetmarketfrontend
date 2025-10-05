import { IImageAttr, IImageFormats, TadditionalImages, Timage } from "./image"

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
    status: string
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
                status: string
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
    name: string
    slug: string
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
    status: string
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
}

export interface IProductCard {
    id: number
    name: string
    slug: string
    mpn: string
    barcode: string
    price: number
    sale_price: number
    is_sale: boolean
    is_hot: boolean
    inventory: number
    is_in_house: boolean
    status: string
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
    is_hot: boolean
    inventory: number
    is_in_house: boolean
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

export type TProductPage = { product: IProductPage } & { similarProducts: ISimilarProductPage[] }

