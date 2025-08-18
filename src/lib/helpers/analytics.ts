import { ICartItem } from '@/lib/interfaces/cart';
import { sendGAEvent } from '@next/third-parties/google';
import { createCategories, getCartTotal } from './checkout';

export const trackCartEvent = (event: string, items: ICartItem[]) => {
    sendGAEvent({
        event: event,
        currency: "EUR",
        value: getCartTotal(items),
        items: items.map(item => {
            const categories = createCategories(item)
            return {
                item_id: item.id,
                item_name: item.name,
                item_brand: item.brand,
                discount: item.is_sale && item.sale_price ? (item.price - item.sale_price).toFixed(2) : 0,
                item_category: categories.item_category,
                item_category2: categories.item_category2,
                item_category3: categories.item_category3,
                price: item.is_sale && item.sale_price ? item.sale_price : item.price,
                quantity: item.quantity
            }
        }
        )
    });
};