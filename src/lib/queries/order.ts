import { IOrder } from "../interfaces/order";
import { storefrontFetch } from "../helpers/storefrontApi";

/**
 * Σύνοψη παραγγελίας για τις σελίδες «Ευχαριστούμε» / «Αποτυχία».
 * ΜΟΝΟ από server component: καλεί απευθείας το Strapi με το
 * STOREFRONT_SECRET. Το orderId (documentId) έρχεται από το httpOnly cookie
 * _mmo που γράφει ο server στη δημιουργία της παραγγελίας.
 */
export async function getOrder(orderId: string | null | undefined): Promise<IOrder | null> {
    if (!orderId) return null
    try {
        return await storefrontFetch<IOrder>('/storefront/orders/summary', {
            body: { orderDocumentId: String(orderId) },
        })
    } catch (error) {
        console.error('getOrder:', error)
        return null
    }
}
