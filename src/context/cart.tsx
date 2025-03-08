'use client'
import { sendGAEvent } from '@next/third-parties/google'
import { GET_CART_PRODUCTS, GET_PRODUCT_PRICE } from '@/lib/queries/productQuery';
import { getStrapiMedia } from '@/repositories/medias';
import { fetcher } from '@/repositories/repository';
import Image from 'next/image';
import { createContext, useState, useEffect } from 'react'
import { FaRegImage } from 'react-icons/fa6';
import { toast } from 'sonner';
import { IProductPriceProps, IProducts } from '@/lib/interfaces/product';

export interface ICartItem {
  id: number,
  name: string,
  brand: string | null,
  slug: string,
  image: string | null,
  price: number,
  quantity: number,
  weight: number,
  isAvailable: boolean,
  is_sale: boolean
  sale_price: number
  category: {
    data: {
      attributes: {
        name: string
        parents: {
          data: {
            attributes: {
              name: string
              parents: {
                data: {
                  attributes: {
                    name: string
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

interface ICartItemsContext {
  cartItems: ICartItem[],
  addToCart: (cartItem: ICartItem) => void;
  removeFromCart: (cartItem: ICartItem) => void;
  increaseQuantity: (cartItem: ICartItem) => void;
  decreaseQuantity: (cartItem: ICartItem) => void;
  clearCart: () => void;
  sendEvent: (event: string) => void;
  cartTotal: number;
}

export const CartContext = createContext<ICartItemsContext>({
  cartItems: [],
  addToCart: () => { },
  removeFromCart: () => { },
  increaseQuantity: () => { },
  decreaseQuantity: () => { },
  clearCart: () => { },
  sendEvent: () => { },
  cartTotal: 0
})

export const createCategories = (item: ICartItem) => {
  let categories: {
    item_category?: string,
    item_category2?: string,
    item_category3?: string
  } = {}

  if (item.category.data?.attributes.parents.data[0]?.attributes.parents.data[0]?.attributes.name) {
    categories.item_category = item.category.data?.attributes.parents.data[0]?.attributes.parents.data[0]?.attributes.name
    categories.item_category2 = item.category.data?.attributes.parents.data[0]?.attributes.name
    categories.item_category3 = item.category.data?.attributes.name
  }
  else if (item.category.data?.attributes.parents.data[0]?.attributes.name) {
    categories.item_category = item.category.data?.attributes.parents.data[0]?.attributes.name
    categories.item_category2 = item.category.data?.attributes.name
  }
  else if (item.category.data?.attributes.name) {
    categories.item_category = item.category.data?.attributes.name
  }

  return categories
}

export const CartProvider = ({ children }: any) => {
  const [firstRender, setFirstRender] = useState(true);
  const [cartItems, setCartItems] = useState<ICartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0);

  const checkIfItemIsInCart = (item: ICartItem) => {
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
    let itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price
    const discount = item.is_sale && item.sale_price ? (item.price - item.sale_price).toFixed(2) : 0

    return { isItemInCart, itemPrice, discount }
  }

  const synchronizeCart = async (cart: ICartItem[]) => {

    const query = GET_CART_PRODUCTS

    const itemIds = cart.map(item => item.id)
    const variables = []
    for (let itemId of itemIds) {
      variables.push({ id: { eq: itemId } })
    }

    let filters: ({ [key: string]: object }) = {
      or: variables,
    }

    if (itemIds.length > 0) {
      const response = await fetcher({ query, variables: { filters } })

      const data = await response as IProducts
      const dbIds = data.products.data.map(item => item.id)

      const test = cart.map((cartItem) =>
        !dbIds.includes(cartItem.id)
          ? { ...cartItem, isAvailable: false }
          : { ...cartItem, isAvailable: true }
      )
      setCartItems(test)
    }
  }

  const addToCart = (item: ICartItem) => {
    try {
      const { isItemInCart, itemPrice, discount } = checkIfItemIsInCart(item)
      const addedQuantity = item.quantity | 1

      if (isItemInCart) {
        setCartItems(
          cartItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + addedQuantity }
              : cartItem
          )
        );
      } else {
        setCartItems([...cartItems, { ...item, quantity: addedQuantity, price: itemPrice, is_sale: item.is_sale, sale_price: item.sale_price, isAvailable: true }]);
      }

      const categories = createCategories(item)

      toast.success(() => (
        <>
          <p className='mb-4'>Ένα προϊόν προστέθηκε στο καλάθι σας!</p>
        </>
      ), {
        description: () =>
          <div className='grid gap-2'>
            <div className='grid grid-cols-5 gap-2'>
              {item.image ? <Image
                width={48}
                height={48}
                src={getStrapiMedia(item.image)}
                alt={item.name || ""}
                quality={75}
                aria-label={item.name || ""}
                blurDataURL={getStrapiMedia(item.image)}
                placeholder="blur"
              /> :
                <FaRegImage className='h-40 w-40 text-siteColors-purple dark:text-slate-200' />}
              <p className='col-span-4 line-clamp-3 break-all font-semibold'>{item.name}</p>
            </div>
            <p className='text-right font-semibold text-lg'>{itemPrice} €</p>
          </div>,
        position: 'top-right',
      })

      let eventValue = {
        value: {
          currency: "EUR",
          value: itemPrice * addedQuantity,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              item_brand: item.brand,
              discount: discount,
              item_category: categories.item_category,
              item_category2: categories.item_category2,
              item_category3: categories.item_category3,
              price: itemPrice,
              quantity: addedQuantity
            }
          ]
        }
      }

      sendGAEvent('event', 'add_to_cart', {
        eventValue
      })
    } catch (error) {
      toast.error("Κάτι πήγε στραβά!", {
        position: 'top-right',
      })
    }


  };

  const removeFromCart = (item: ICartItem) => {
    try {
      const { isItemInCart, itemPrice, discount } = checkIfItemIsInCart(item)

      if (isItemInCart) {
        setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id));
      }

      toast.success("Ένα προϊόν αφαιρέθηκε από το καλάθι σας!", {
        position: 'top-right',
      })

      const categories = createCategories(item)

      let eventValue = {
        value: {
          currency: "EUR",
          value: itemPrice * item.quantity,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              item_brand: item.brand,
              discount: discount,
              item_category: categories.item_category,
              item_category2: categories.item_category2,
              item_category3: categories.item_category3,
              price: itemPrice,
              quantity: item.quantity
            }
          ]
        }
      }

      sendGAEvent('event', 'remove_from_cart', {
        eventValue
      })

    } catch (error) {
      toast.error("Κάτι πήγε στραβά!", {
        position: 'top-right',
      })
    }
  };

  const increaseQuantity = (item: ICartItem) => {
    const { isItemInCart, itemPrice, discount } = checkIfItemIsInCart(item)

    if (isItemInCart) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );


      const categories = createCategories(item)

      let eventValue = {
        value: {
          currency: "EUR",
          value: itemPrice,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              item_brand: item.brand,
              discount: discount,
              item_category: categories.item_category,
              item_category2: categories.item_category2,
              item_category3: categories.item_category3,
              price: itemPrice,
              quantity: 1
            }
          ]
        }
      }

      sendGAEvent('event', 'add_to_cart', {
        eventValue
      })
    }
  };

  const decreaseQuantity = (item: ICartItem) => {
    const { isItemInCart, itemPrice, discount } = checkIfItemIsInCart(item)

    if (isItemInCart) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id && cartItem.quantity > 1
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );

      const categories = createCategories(item)

      let eventValue = {
        value: {
          currency: "EUR",
          value: itemPrice,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              item_brand: item.brand,
              discount: discount,
              item_category: categories.item_category,
              item_category2: categories.item_category2,
              item_category3: categories.item_category3,
              price: itemPrice,
              quantity: 1
            }
          ]
        }
      }

      sendGAEvent('event', 'remove_from_cart', {
        eventValue
      })

    }
  };

  const sendEvent = (event: string) => {
    let items: any = []
    cartItems.forEach((item) => {

      let itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price

      const discount = item.is_sale && item.sale_price ? (item.price - item.sale_price).toFixed(2) : 0

      const categories = createCategories(item)

      items.push({
        item_id: item.id,
        item_name: item.name,
        item_brand: item.brand,
        discount: discount,
        item_category: categories.item_category,
        item_category2: categories.item_category2,
        item_category3: categories.item_category3,
        price: itemPrice,
        quantity: item.quantity
      })
    })
    let eventValue = {
      value: {
        currency: "EUR",
        value: cartTotal,
        items: items
      }
    }

    sendGAEvent('event', event, {
      eventValue
    })

  };

  const clearCart = () => {
    setCartItems([]);
  };

  useEffect(() => {
    const getCartTotal = async () => {
      const myHeaders = new Headers();

      myHeaders.append('Content-Type', 'application/json')

      const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ cartItems })
        // mode: "cors",
        // cache: "default",
      };


      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findCartTotal`,
        myInit,
      )
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json()
      setCartTotal(json.cartTotal)
    };

    if (cartItems)
      getCartTotal()
  }, [cartItems])


  useEffect(() => {

    if (firstRender) return;
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, firstRender]);

  useEffect(() => {
    const cartItems = localStorage.getItem("cartItems");
    if (cartItems) {
      setCartItems(JSON.parse(cartItems));
      // synchronizeCart(JSON.parse(cartItems))
    }
    setFirstRender(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const cartItems = localStorage.getItem("cartItems");
      if (cartItems) {
        synchronizeCart(JSON.parse(cartItems))
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        sendEvent,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};