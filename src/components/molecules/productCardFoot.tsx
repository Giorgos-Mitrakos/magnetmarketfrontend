"use client"
import { CartContext } from "@/context/cart"
import { useContext } from "react"
import { FaHeart, FaOpencart, FaRegEye } from "react-icons/fa"

function ProductCardFoot({ product }: any) {
    const { cartItems, addToCart } = useContext(CartContext)

    const item = {
        id: product.id,
        name: product.attributes.name,
        slug: product.attributes.slug,
        image: product.attributes.image.data?.attributes.url || null,
        weight: product.attributes.weight,
        price: product.attributes.price
    }

    const handleAddProductClick = (product: any) => {
        product.quantity = 1
        addToCart(product)
    }

    return (
        <div className="grid grid-cols-3 gap-1 text-3xl text-slate-50">
            <button
                className="flex justify-center items-center text-slate-400 dark:text-slate-300 rounded-md
                    hover:bg-gradient-to-br hover:from-siteColors-pink hover:to-siteColors-purple hover:text-white"
                aria-label="Προσθήκη στα αγαπημένα">
                <FaHeart
                    aria-label="Καρδιά" />
            </button>
            <button
                className="flex justify-center items-center text-slate-400 dark:text-slate-300 rounded-md 
                    hover:bg-gradient-to-br hover:from-siteColors-pink hover:to-siteColors-purple hover:text-white"
                aria-label="Επισκόπηση προϊόντος">
                <FaRegEye
                    aria-label="Επισκόπηση προϊόντος"/>
            </button>
            <button
                onClick={() => handleAddProductClick(item)}
                className="grid place-content-center 
                    bg-gradient-to-br from-siteColors-lightblue to-siteColors-blue
                    hover:bg-gradient-to-br hover:from-siteColors-pink hover:to-siteColors-purple hover:text-white
                     rounded-md"
                aria-label="Προσθήκη προϊόντος στο το καλάθι σου">
                <FaOpencart
                    aria-label="Καλάθι"/>
            </button>

            {/* <button className='p-2 w-full mx-auto text-white mt-4 tracking-wide rounded-lg shadow-inner bg-gradient-to-t from-siteColors-lightblue via-siteColors-blue to-siteColors-lightblue hover:bg-gradient-to-tl'>Αγόρασε Τώρα</button> */}
        </div>
    )
}

export default ProductCardFoot