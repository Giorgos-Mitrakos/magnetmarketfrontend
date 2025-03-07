import { IProductBrandAttr } from "./product";

export interface IBrands {
    brands: IBrandsData
}

export interface IBrandsData {
        data: {
            id: number
            attributes: IProductBrandAttr
        }[]
}