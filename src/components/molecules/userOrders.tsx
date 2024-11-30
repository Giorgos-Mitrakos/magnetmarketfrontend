'use client'
import { useApiRequest } from "@/repositories/clientRepository";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import NextImage from "../atoms/nextImage";
import { getStrapiMedia } from "@/repositories/medias";
import Image from "next/image";

interface IOrder {
    id: number | string
    createdAt: Date,
    updatedAt: Date
    shipping_address: {
        id: number,
        firstname: string,
        lastname: string,
        telephone: string;
        mobilePhone: string;
        street: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        afm: string,
        doy: string,
        companyName: string,
        businessActivity: string,
        title: string,
        isInvoice: boolean
    },
    billing_address: {
        id: number,
        firstname: string,
        lastname: string,
        telephone: string;
        mobilePhone: string;
        street: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        afm: string,
        doy: string,
        companyName: string,
        businessActivity: string,
        title: string,
        isInvoice: boolean
        different_shipping: boolean;
    }
    different_shipping: boolean,
    products: {
        id: string | number
        name: string
        slug: string
        image: string
        price: number
        sale_price: number
        quantity: number
    }[],
    total: number,
    shipping: {
        name: string,
        cost: number
    },
    payment: {
        name: string,
        cost: number
    },
    status: string,
    comments: {
        date: Date,
        type: string,
        comment: string
    }
    isInvoice: boolean
}

interface IOrders {
    orders: IOrder[]
}

const Accordion = ({ order }: { order: IOrder }) => {
    const [open, setOpen] = useState(false)
    const time = new Date(order.createdAt);

    return (
        <div className="my-2">
            <div className="border-2 bg-slate-100 grid grid-cols-6 items-center hover:cursor-pointer" onClick={() => setOpen(!open)} >
                <p className="p-4">{open ? <FaMinus /> : <FaPlus />}</p>
                <p>{time.toLocaleDateString()}</p>
                <p>{order.id}</p>
                <p></p>
                <p>{order.status}</p>
                <button className="flex justify-center items-center m-2 px-4 py-2 rounded border md:text-slate-100 font-semibold
                bg-red-500 hover:bg-red-600 disabled:bg-red-200 shadow-md" disabled={order.status !== "Ολοκληρωμένη"}>Ακύρωση</button>
            </div>
            {open && <div className={`w-full border transition-transform transform ${open ? "translate-y-0" :
                    "translate-y-full"} duration-500 `}>
                <div className="grid w-full grid-cols-3 py-4">
                    <div>
                        <h3 className="font-semibold">Χρέωση {!order.different_shipping && '- Αποστολή'}</h3>
                        <ul className="text-sm">
                            {order.isInvoice ?
                                <>
                                    <li>{order.billing_address.companyName}</li>
                                    <li>{order.billing_address.businessActivity}</li>
                                    <li>Α.Φ.Μ: {order.billing_address.afm}</li>
                                    <li>Δ.Ο.Υ: {order.billing_address.doy}</li>
                                </>
                                :
                                <>
                                    <li>{order.billing_address.firstname} {order.billing_address.lastname}</li>
                                </>
                            }
                            <li>{order.billing_address.street}, {order.billing_address.city}</li>
                            <li>{order.billing_address.state}, Τ.Κ: {order.billing_address.zipCode}</li>
                            <li>{order.billing_address.country}</li>
                        </ul>
                    </div>
                    {order.different_shipping &&
                        <div>
                            <h3 className="font-semibold">Αποστολή</h3>
                            <ul className="text-sm">
                                <li>{order.shipping_address.firstname} {order.shipping_address.lastname}</li>
                                <li>{order.shipping_address.street}, {order.shipping_address.city}</li>
                                <li>{order.shipping_address.state}, Τ.Κ: {order.shipping_address.zipCode}</li>
                                <li>{order.shipping_address.country}</li>
                            </ul>
                        </div>}
                    <div>Τιμολόγιο: {order.isInvoice ? "Ναι" : "Όχι"}</div>
                    <div className="col-span-3 mt-8">
                        <ul className="mx-8">
                            <li className="grid grid-cols-6 items-center font-semibold">
                                <p></p>
                                <p className="col-span-3">Προϊόν</p>
                                <p>Ποσότητα</p>
                                <p>Τιμή</p>
                            </li>
                            {order.products.map(product => (
                                <>
                                    <li className="grid grid-cols-6 items-center border">
                                        <Image
                                            // layout='responsive'
                                            className="object-contain p-4"
                                            width={96}
                                            height={96}
                                            src={getStrapiMedia(product.image)}
                                            alt={product.name || ""}
                                            quality={75}
                                            aria-label={product.name || ""}
                                            blurDataURL={getStrapiMedia(product.image)}
                                            placeholder="blur"
                                        />
                                        <p className="col-span-3">{product.name}</p>
                                        <p className="">{product.quantity}</p>
                                        <p className="">{product.sale_price ? product.sale_price : product.price}</p>
                                    </li>
                                </>
                            ))}
                            <div className="text-right m-4 font-semibold">
                                Σύνολο: {order.total} €
                            </div>
                        </ul>
                    </div>

                </div>
            </div>}
        </div>
    )
}

const UserOrders = ({ jwt }: { jwt: string }) => {

    const { data, loading, error }: { data: IOrders, loading: boolean, error: any } = useApiRequest({method:"GET", api: "/api/user-address/getUserOrders", jwt })

    return (
        <div className="space-y-4">
            <h2 className="mb-4 text-xl text-siteColors-blue font-bold">Οι παραγγελίες μου</h2>
            {loading && !data ? <div>Loading</div> :
                <div>
                    <div className="grid grid-cols-6 w-full font-semibold mb-2">
                        <p></p>
                        <p>Ημερομηνία</p>
                        <p>Αριθμός Παραγγελίας</p>
                        <p>Tracking</p>
                        <p>Status</p>
                        <p></p>
                    </div>
                    <div>
                        {data.orders.map(order =>
                            <Accordion key={order.id} order={order} />
                        )}
                    </div>
                </div>}
        </div>
    )
}

export default UserOrders