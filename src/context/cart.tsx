'use client'
import NextImage from '@/components/atoms/nextImage';
import { GET_CART_PRODUCTS, GET_PRODUCT_PRICE, IGetCartProductsProps, IProductPriceProps } from '@/lib/queries/productQuery';
import { getStrapiMedia } from '@/repositories/medias';
import { fetcher } from '@/repositories/repository';
import Image from 'next/image';
import { createContext, useState, useEffect } from 'react'
import { toast } from 'sonner';

export interface ICartItem {
  id: number,
  name: string,
  slug: string,
  image: string,
  price: number,
  quantity: number,
  isAvailable: boolean
}

interface ICartItemsContext {
  cartItems: ICartItem[],
  addToCart: (cartItem: ICartItem) => void;
  removeFromCart: (cartItem: ICartItem) => void;
  increaseQuantity: (cartItem: ICartItem) => void;
  decreaseQuantity: (cartItem: ICartItem) => void;
  clearCart: () => void;
  cartTotal: number;
}

export const CartContext = createContext<ICartItemsContext>({
  cartItems: [],
  addToCart: () => { },
  removeFromCart: () => { },
  increaseQuantity: () => { },
  decreaseQuantity: () => { },
  clearCart: () => { },
  cartTotal: 0
})

export const CartProvider = ({ children }: any) => {
  const [firstRender, setFirstRender] = useState(true);
  const [cartItems, setCartItems] = useState<ICartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0);

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
      const data = await response as IGetCartProductsProps
      const dbIds = data.products.data.map(item => item.id)

      const test = cart.map((cartItem) =>
        !dbIds.includes(cartItem.id)
          ? { ...cartItem, isAvailable: false }
          : { ...cartItem, isAvailable: true }
      )
      setCartItems(test)
    }
  }

  const addToCart = async (item: ICartItem) => {
    try {
      const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
      const query = GET_PRODUCT_PRICE
      const data = await fetcher({ query, variables: { id: item.id } })
      const product = data as IProductPriceProps
      let itemPrice = product.product.data.attributes.is_sale && product.product.data.attributes.sale_price ? product.product.data.attributes.sale_price : product.product.data.attributes.price
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
        setCartItems([...cartItems, { ...item, quantity: addedQuantity, price: itemPrice, isAvailable: true }]);
      }
      toast.success(() => (
        <>
          <p className='mb-4'>Ένα προϊόν προστέθηκε στο καλάθι σας!</p>
        </>
      ), {
        description: () => <div className='grid grid-cols-5 gap-2'>
          <Image
            width={48}
            height={48}
            src={getStrapiMedia(item.image)}
            alt={item.name || ""}
            quality={75}
            aria-label={item.name || ""}
            blurDataURL={getStrapiMedia(item.image)}
            placeholder="blur"
          />
          <p className='col-span-3 line-clamp-3 font-semibold'>{item.name}</p>
          <p className='text-center font-semibold text-lg'>{itemPrice} €</p>
        </div>,
        position: 'top-right',
      })

    } catch (error) {
      toast.error("Κάτι πήγε στραβά!", {
        position: 'top-right',
      })
    }


  };

  const removeFromCart = (item: ICartItem) => {
    try {
      const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);

      if (isItemInCart) {
        setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id));
      }

      toast.success("Ένα προϊόν αφαιρέθηκε από το καλάθι σας!", {
        position: 'top-right',
      })
    } catch (error) {
      toast.error("Κάτι πήγε στραβά!", {
        position: 'top-right',
      })
    }
  };

  const increaseQuantity = (item: ICartItem) => {
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);

    if (isItemInCart) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    }
  };

  const decreaseQuantity = (item: ICartItem) => {
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);

    if (isItemInCart) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id && cartItem.quantity > 1
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
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
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};