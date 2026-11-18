import { IImageAttr } from "./image";
import { IProductBrandAttr } from "./product";

export interface IBrands {
    id: number
    name: string
    slug: string
    /** (2026-10-24) null = χωρίς λογότυπο (το site δείχνει το όνομα) */
    logo: IImageAttr | null
    description?: string | null
    /** Ορατά προϊόντα στο site */
    productCount?: number
}