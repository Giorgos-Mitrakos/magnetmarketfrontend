'use client'
import { GET_CART_PRODUCTS, GET_PRODUCT_PRICE, IGetCartProductsProps, IProductPriceProps } from '@/lib/queries/productQuery';
import { fetcher } from '@/repositories/repository';
import { createContext, useState, useEffect } from 'react'

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
  getCartTotal: () => number;
}

export const CartContext = createContext<ICartItemsContext>({
  cartItems: [],
  addToCart: () => { },
  removeFromCart: () => { },
  increaseQuantity: () => { },
  decreaseQuantity: () => { },
  clearCart: () => { },
  getCartTotal: () => 0
})

export const CartProvider = ({ children }: any) => {
  const [firstRender, setFirstRender] = useState(true);
  const [cartItems, setCartItems] = useState<ICartItem[]>([])

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
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
    const query = GET_PRODUCT_PRICE
    const data = await fetcher({ query, variables: { id: item.id } })
    const product = data as IProductPriceProps
    let itemPrice = product.product.data.attributes.is_sale && product.product.data.attributes.sale_price ? product.product.data.attributes.sale_price : product.product.data.attributes.price

    if (isItemInCart) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, price: itemPrice, isAvailable: true }]);
    }
  };

  const removeFromCart = (item: ICartItem) => {
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);

    if (isItemInCart && isItemInCart.quantity === 1) {
      setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id));
    } else {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
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

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

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
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};