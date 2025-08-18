import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import { FaRegImage } from "react-icons/fa6"
import { toast } from "sonner"
import { ICartItem } from "../interfaces/cart"


export const addToCartToast = (item: ICartItem) => {

    const itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price
    toast.success(() => (
        <>
            <p className='mb-4'>Ένα προϊόν προστέθηκε στο καλάθι σας!</p>
        </>
    ), {
        description: () =>
            <div className='grid gap-2'>
                <div className='grid grid-cols-5 gap-2 h-16'>
                    {item.image ? <Image
                        width={48}
                        height={48}
                        src={getStrapiMedia(item.image.data.attributes.formats.thumbnail.url)}
                        alt={item.name || ""}
                        quality={75}
                        aria-label={item.name || ""}
                        blurDataURL={getStrapiMedia(item.image.data.attributes.formats.thumbnail.url)}
                        placeholder="blur"
                    /> :
                        <FaRegImage className='h-40 w-40 text-siteColors-purple dark:text-slate-200' />}
                    <p className='col-span-4 line-clamp-3 break-all font-semibold'>{item.name}</p>
                </div>
                <p className='text-right font-semibold text-lg'>{itemPrice} €</p>
            </div>,
        position: 'top-right',
    })
}

export const removeItemToast = (item: ICartItem) => {
    toast.success("Ένα προϊόν αφαιρέθηκε από το καλάθι σας!", {
        position: 'top-right',
    })
}