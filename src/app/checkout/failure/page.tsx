import { getCookies } from "@/lib/helpers/actions"
import { IOrder, IOrderCookie } from "../thank-you/page"
import { requestSSR } from "@/repositories/repository"
import { GET_ORDER } from "@/lib/queries/shippingQuery"
import Image from "next/image"
import { FaRegImage } from "react-icons/fa6";

export default async function Fail() {

    const orderCookie = await getCookies({ name: 'magnet_market_order' })

    const rcfCookie = await getCookies({ name: '_rcf' })

    const order: IOrderCookie = orderCookie ? JSON.parse(orderCookie.value) : null

    const resultCode = rcfCookie ? JSON.parse(rcfCookie.value) : null

    const response = await requestSSR({
        query: GET_ORDER, variables: { id: order.orderId }
    });

    const data = await response as IOrder

    let resultAnswer = ''

    switch (resultCode.RCF) {
        case 1:
            resultAnswer = 'H συναλλαγή δεν έγινε δεκτή από την εκδότρια Τράπεζα'
            break;

        default:
            break;
    }

    return (
        <section className="rounded-lg p-4 bg-gradient-to-tr from-siteColors-lightblue via-siteColors-blue to-siteColors-pink mb-16">
            <h1 className="text-2xl mb-4 font-semibold text-slate-200 text-center">Η συναλλαγή απέτυχε!</h1>
            <h2 className="text-xl mb-4 font-semibold text-slate-200 text-center">Αρ. {order.orderId}</h2>
            {resultAnswer !== '' &&
                <div className="text-lg mb-4 text-slate-200 text-center">
                    <h2>H συναλλαγή σας απορρίφθηκε!</h2>
                    <p>{resultAnswer}</p>
                </div>
            }
            <div className="flex justify-center flex-wrap gap-4">
                {data && data.order.data.attributes.products.map(item => (
                    <div key={item.id} className="grid grid-cols-5 h-60 w-96 shadow-md rounded-md bg-white">
                        <div className="flex relative justify-center items-center p-4 col-span-2">
                            {item.image ? <Image
                                className="object-contain py-4 pl-4"
                                key={item.id}
                                src={`${process.env.NEXT_PUBLIC_API_URL}${item.image.data.attributes.formats.small ? item.image.data.attributes.formats.small.url : item.image.data.attributes.url}`}
                                alt={item.name}
                                // height={120}
                                // width={120}
                                fill
                            /> :
                                <FaRegImage className='h-40 w-40 text-siteColors-purple dark:text-slate-200' />}
                        </div>
                        <div className="flex flex-col justify-between col-span-3 p-4 space-y-2 text-gray-500">
                            <h2 className="text-siteColors-purple font-semibold line-clamp-4 row-span-2">{item.name}</h2>
                            <div className="flex flex-col">
                                <div className="flex space-x-2">
                                    <h3>Κωδικός:</h3>
                                    <p className="text-left">{item.id}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <h3>Ποσότητα:</h3>
                                    <p>{item.quantity}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )

}