import { IImageAttr, Timage } from "./image"
import { IProdChar, IProductBrand, IProductCategory } from "./product"

interface IcategoryProductsAttr {
    name: string
    slug: string
    weight: number
    price: number
}

export type IcategoryProductsProps = {
    id: number
    attributes: IcategoryProductsAttr
    & IProdChar
    & IProductBrand
    & Timage
    & IProductCategory
}

export interface IcategoryProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                categories: {
                    data: {
                        attributes: {
                            name: string
                            slug: string
                            categories: {
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
        }[]
    }
}