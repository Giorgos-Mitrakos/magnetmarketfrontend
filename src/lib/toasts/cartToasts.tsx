import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import { FaRegImage, FaCheck } from "react-icons/fa6"
import { toast } from "sonner"
import { ICartItem } from "../interfaces/cart"
import { FaShoppingBag } from "react-icons/fa"

export const addToCartToast = (item: ICartItem) => {
    const itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price

    toast.success(() => (
        <div className="flex items-start justify-center  p-2">
            <p className="font-semibold text-slate-900 text-base">
                Προστέθηκε στο καλάθι
            </p>
        </div>
    ), {
        description: () => (
            <div className="mt-3 p-4 dark:bg-gray-900">
                <div className="flex items-start gap-4">
                    {/* Product Image - Μεγαλύτερη και με λευκό φόντο */}
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-gray-100">
                        {item.image ? (
                            <Image
                                width={96}
                                height={96}
                                src={getStrapiMedia(item.image.formats.thumbnail.url)!}
                                alt={item.name || ""}
                                quality={90}
                                className="w-full h-full object-contain p-1"
                                blurDataURL={getStrapiMedia(item.image.formats.thumbnail.url)!}
                                placeholder="blur"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FaRegImage className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm leading-tight line-clamp-2 mb-3">
                            {item.name}
                        </h4>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaShoppingBag className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Ποσότητα: 1
                                </span>
                            </div>

                            {/* Πιο έντονη τιμή */}
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-2xl text-slate-700 whitespace-nowrap">
                                    €{itemPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        position: 'top-right',
        duration: 4000,
        className: '!bg-white dark:!bg-gray-900 !shadow-lg !rounded-xl !border !border-gray-200 dark:!border-gray-700 !p-4',
        style: {
            borderLeft: '4px solid #10B981'
        }
    })
}

export const removeItemToast = (item: ICartItem) => {
    toast.success(() => (
        <div className="flex items-start gap-4 p-2">
            <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-base">
                    Αφαιρέθηκε από το καλάθι
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {item.name}
                </p>
            </div>
        </div>
    ), {
        position: 'top-right',
        duration: 3000,
        className: '!bg-white dark:!bg-gray-900 !shadow-lg !rounded-xl !border !border-gray-200 dark:!border-gray-700 !p-4',
        style: {
            borderLeft: '4px solid #EF4444'
        }
    })
}