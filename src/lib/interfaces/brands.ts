import { IImageAttr } from "./image";
import { IProductBrandAttr } from "./product";

export interface IBrands {
    id: number
    name: string
    slug: string
    logo: IImageAttr
}