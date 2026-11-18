"use client"

import { useState } from "react"
import { FaMinus, FaPlus } from "react-icons/fa6"
import { FaOpencart } from "react-icons/fa"
import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import { FaRegImage } from "react-icons/fa6"
import { IProductCard } from "@/lib/interfaces/product"
import { ICartItem } from "@/lib/interfaces/cart"
import { useCheckout } from "@/context/checkout"
import { announceAddedToCart } from "@/lib/helpers/crossSellEvents"
import WishlistButton from "@/components/atoms/WishlistButton"
import PriceAlertButton from "@/components/atoms/PriceAlertButton"
import { PreorderPassView } from "@/lib/interfaces/preorder"
import { toast } from "sonner"

function ProductAddToCart({ product, preorder = null }: {
  product: IProductCard
  /** (2026-10-22) Έγκυρος σύνδεσμος προπαραγγελίας για προϊόν «Αναμένεται» */
  preorder?: Extract<PreorderPassView, { valid: true }> | null
}) {
  const { checkout, dispatch } = useCheckout()

  const isAskForPrice = product.status === 'AskForPrice';
  const isOutOfStock = product.status === 'OutOfStock';
  const isExpacted = product.status === 'IsExpected';
  const isPreorder = isExpacted && !!preorder;
  const blocked = isAskForPrice || isOutOfStock || (isExpacted && !isPreorder);
  // (2026-10-22) Επιλογή ποσότητας πριν την προσθήκη στο καλάθι
  const [qty, setQty] = useState(1)
  const inCartQty = checkout.cart.find(c => c.id === product.id)?.quantity ?? 0
  const maxQty = isPreorder ? Math.max(0, preorder!.maxQuantity - inCartQty) : 99
  const blockedLabel = isAskForPrice ? "Μη Διαθέσιμο" : isOutOfStock ? "Εξαντλήθηκε" : "Αναμένεται";

  const item: ICartItem = {
    id: product.id,
    // documentId του Strapi v3 — με αυτό ταυτοποιείται το προϊόν στην παραγγελία
    documentId: (product as { documentId?: string }).documentId,
    name: product.name,
    slug: product.slug,
    status: product.status,
    image: product.image,
    weight: product.weight,
    price: product.price,
    brand: product.brand?.name || null,
    quantity: Math.max(1, Math.min(qty, maxQty || 1)),
    isAvailable: !isAskForPrice, // Προσθήκη ένδειξης διαθεσιμότητας
    is_sale: product.is_sale,
    sale_price: product.sale_price,
    category: product.category,
    ...(isPreorder ? { preorderToken: preorder!.token, preorderMax: preorder!.maxQuantity } : {}),
  }

  const handleAddProductClick = () => {
    if (blocked) return;
    if (isPreorder) {
      if (inCartQty + item.quantity > preorder!.maxQuantity) {
        toast.error(`Με τον σύνδεσμο προπαραγγελίας μπορείτε να παραγγείλετε έως ${preorder!.maxQuantity} τεμ.`)
        return
      }
    }

    dispatch({ type: "ADD_ITEM", payload: item })
    announceAddedToCart(item)
    setQty(1)
  }

  const stepper = (size: 'md' | 'lg') => (
    <div
      className={`shrink-0 flex items-center rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 ${size === 'lg' ? 'h-14' : 'h-10'}`}
      role="group"
      aria-label="Ποσότητα"
    >
      <button
        type="button"
        className="px-3 h-full text-slate-600 dark:text-slate-300 disabled:opacity-40"
        onClick={() => setQty(q => Math.max(1, q - 1))}
        disabled={qty <= 1}
        aria-label="Λιγότερα"
      >
        <FaMinus className="w-3 h-3" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={maxQty || 1}
        value={qty}
        onChange={(e) => {
          const n = Math.floor(Number(e.target.value))
          setQty(Number.isFinite(n) ? Math.max(1, Math.min(n, maxQty || 1)) : 1)
        }}
        className="w-12 h-full text-center bg-transparent text-slate-800 dark:text-slate-100 font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Ποσότητα"
      />
      <button
        type="button"
        className="px-3 h-full text-slate-600 dark:text-slate-300 disabled:opacity-40"
        onClick={() => setQty(q => Math.min(maxQty || 1, q + 1))}
        disabled={qty >= (maxQty || 1)}
        aria-label="Περισσότερα"
      >
        <FaPlus className="w-3 h-3" />
      </button>
    </div>
  )

  const displayPrice = product.is_sale && product.sale_price
    ? product.sale_price
    : product.price;

  const buttonClasses = {
    mobile: {
      active: "flex items-center justify-center px-6 py-3 bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white rounded-lg font-semibold hover:from-siteColors-pink hover:to-siteColors-purple transition-all duration-200 shadow-md hover:shadow-lg",
      disabled: "flex items-center justify-center px-6 py-3 bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 rounded-lg font-semibold cursor-not-allowed"
    },
    desktop: {
      active: "w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-siteColors-blue to-siteColors-lightblue text-white rounded-xl font-semibold text-lg hover:from-siteColors-lightblue hover:to-siteColors-blue transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105",
      disabled: "w-full flex items-center justify-center px-6 py-4 bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 rounded-xl font-semibold text-lg cursor-not-allowed"
    }
  };

  return (
    <>
      {/* Mobile View - Fixed Bottom Bar */}
      <div className="fixed md:hidden bottom-14 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg z-40 p-3">
        <div className="flex items-center justify-between">
          {/* Product Image and Price */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 bg-white rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center">
              {product.image ? (
                <Image
                  src={getStrapiMedia(product.image.url)!}
                  alt={product.image.name || product.name}
                  fill
                  className="object-contain p-2"
                  sizes="64px"
                />
              ) : (
                <FaRegImage className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div className="flex flex-col">
              {isAskForPrice ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-siteColors-purple dark:text-siteColors-purple-light">
                    Ζητήστε Τιμή
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Κάλεσέ μας)
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-lg font-bold text-siteColors-purple dark:text-slate-200">
                    {displayPrice.toFixed(2)} €
                  </span>
                  {product.is_sale && !!product.sale_price && (
                    <span className="text-sm line-through text-gray-500 dark:text-slate-400">
                      {product.price.toFixed(2)} €
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Αγαπημένα + Add to Cart Button */}
          <div className="flex items-center gap-2">
          <WishlistButton documentId={item.documentId} product={product} variant="compact" />
          <button
            onClick={handleAddProductClick}
            disabled={blocked}
            className={blocked ? buttonClasses.mobile.disabled : buttonClasses.mobile.active}
            aria-label={blocked ? `Δεν είναι διαθέσιμο για αγορά (${blockedLabel})` : "Προσθήκη στο καλάθι"}
          >
            <FaOpencart className="mr-2" />
            <span>{blocked ? blockedLabel : isPreorder ? "Προπαραγγελία" : "Προσθήκη"}</span>
          </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block mt-6">
        <div className="flex items-center gap-3">
          {!blocked && stepper('lg')}
          {/* flex-1 min-w-0 + μία γραμμή: δίπλα στην ποσότητα το κουμπί δεν «φουσκώνει» σε δύο γραμμές */}
          <button
            onClick={handleAddProductClick}
            disabled={blocked}
            className={`${blocked ? buttonClasses.desktop.disabled : buttonClasses.desktop.active} flex-1 min-w-0 whitespace-nowrap`}
            aria-label={blocked ? `Δεν είναι διαθέσιμο για αγορά (${blockedLabel})` : isPreorder ? "Προπαραγγελία: προσθήκη στο καλάθι" : "Προσθήκη στο καλάθι"}
          >
            <FaOpencart className="mr-3 text-xl shrink-0" />
            <span className="truncate">{blocked ? blockedLabel : isPreorder ? "Προπαραγγελία" : "Προσθήκη στο Καλάθι"}</span>
          </button>
        </div>
        <WishlistButton documentId={item.documentId} product={product} variant="page" className="mt-3" />
        <PriceAlertButton
          documentId={item.documentId}
          productName={product.name}
          price={product.price}
          salePrice={product.sale_price}
          isSale={product.is_sale}
          status={product.status}
          className="mt-3"
        />
      </div>

      {/* Κινητό: η ειδοποίηση τιμής μέσα στη σελίδα (η κάτω μπάρα έχει ήδη καλάθι + καρδιά) */}
      <div className="md:hidden mt-4">
        {/* Κινητό: η ποσότητα εδώ — η «Προσθήκη» της κάτω μπάρας βάζει αυτή την ποσότητα */}
        {!blocked && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">Ποσότητα</span>
            {stepper('md')}
          </div>
        )}
        <PriceAlertButton
          documentId={item.documentId}
          productName={product.name}
          price={product.price}
          salePrice={product.sale_price}
          isSale={product.is_sale}
          status={product.status}
        />
      </div>
    </>
  )
}

export default ProductAddToCart