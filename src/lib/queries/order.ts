import { IOrder } from "../interfaces/order";


export async function getOrder(orderId: number) {
    try {
        const myHeaders = new Headers();

        myHeaders.append('Content-Type', 'application/json')
        myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`)

        const myInit = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                id: orderId
            })
            // mode: "cors",
            // cache: "default",
        };

        const response = await fetch(`${process.env.NEXT_URL}/api/order`, myInit)

        const { order, deliverydays } = await response.json() as IOrder

        return { order, deliverydays }
    } catch (error) {
        return null
    }
}