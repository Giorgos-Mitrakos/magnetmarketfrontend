import { IImageAttr } from "./image";

export interface IOrder {
    order: {
        id: number,
        products: {
            id: number
            name: string,
            slug: string,
            image: IImageAttr,
            price: number,
            weight: number,
            is_sale: boolean,
            quantity: number,
            sale_price: null,
            isAvailable: boolean
        }[],
        total: number,
        status: string,
        billing_address: {
            isInvoice: boolean,
            email: string,
            firstname: string,
            lastname: string,
            street: string,
            city: string,
            state: string,
            zipCode: string,
            country: string,
            telephone: string,
            mobilePhone: string,
            afm: string,
            doy: string,
            companyName: string,
            businessActivity: string,
        }
        different_shipping: boolean,
        shipping_address: {
            firstname: string,
            lastname: string,
            street: string,
            city: string,
            state: string,
            zipCode: string,
            country: string,
            telephone: string,
            mobilePhone: string,
        },
        installments: number,
        payment: {
            name: string;
            cost: number;
        },
        shipping: {
            name: string;
            cost: number;
        }
    },
    deliverydays: {
        early: Date,
        late: Date
    }
}