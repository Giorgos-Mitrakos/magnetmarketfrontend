// «Προστέθηκε στο καλάθι»: αντί για σκέτο toast, ειδοποιείται το παράθυρο
// cross-selling (CrossSellDialog, στο layout). Αν δεν υπάρχουν προτάσεις, το
// παράθυρο δείχνει το συνηθισμένο toast.
import { ICartItem } from '@/lib/interfaces/cart'
import { addToCartToast } from '@/lib/toasts/cartToasts'

export const ADDED_TO_CART_EVENT = 'mm:added-to-cart'
let listeners = 0

export function registerCrossSellListener() {
  listeners++
  return () => {
    listeners = Math.max(0, listeners - 1)
  }
}

export function announceAddedToCart(item: ICartItem) {
  if (typeof window === 'undefined' || listeners === 0) {
    addToCartToast(item)
    return
  }
  window.dispatchEvent(new CustomEvent<ICartItem>(ADDED_TO_CART_EVENT, { detail: item }))
}

/** Μετατροπή κάρτας προϊόντος σε γραμμή καλαθιού (ίδια με productCardFoot) */
export function cardToCartItem(product: any): ICartItem {
  return {
    id: product.id,
    documentId: product.documentId,
    name: product.name,
    slug: product.slug,
    status: product.status,
    image: product.image || null,
    weight: product.weight,
    price: product.price,
    brand: product.brand?.name || null,
    quantity: 1,
    isAvailable: true,
    is_sale: product.is_sale,
    sale_price: product.sale_price,
    category: product.category,
  }
}
