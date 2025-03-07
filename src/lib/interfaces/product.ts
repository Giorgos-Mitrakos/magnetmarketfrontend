import { IImageAttr, TadditionalImages, Timage } from "./image"

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

interface IProdCharAttr {
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
    logo: { data: IImageAttr }
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
            attributes: {
                name: string
                slug: string
                filters: {
                    name: string
                }[]
                parents: {
                    data: {
                        attributes: {
                            name: string
                            slug: string
                            parents: {
                                data: {
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
      }
    }
  }
}


export type TProductAttr = IProductAttr & Timage & TadditionalImages
    & IProductBrand & IProdChar & IProductCategory & ISeo & ISupplier