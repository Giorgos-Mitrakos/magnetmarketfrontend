'use client'

import { useApiRequest } from "@/repositories/clientRepository";
import { useState } from "react";
import {
    FaCaretUp,
    FaCaretDown,
    FaRegImage,
    FaTruck,
    FaReceipt,
    FaBox,
    FaEuroSign
} from "react-icons/fa";
import { getStrapiMedia } from "@/repositories/medias";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaRegTrashCan } from "react-icons/fa6";
import { IImageAttr } from "@/lib/interfaces/image";

// Types
interface Address {
    id: number;
    firstname: string;
    lastname: string;
    telephone: string;
    mobilePhone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    afm: string;
    doy: string;
    companyName: string;
    businessActivity: string;
    title: string;
    isInvoice: boolean;
    different_shipping?: boolean;
}

interface Product {
    id: string | number;
    name: string;
    slug: string;
    image: IImageAttr,
    price: number;
    sale_price: number;
    quantity: number;
}

interface Order {
    id: number | string;
    createdAt: string;
    updatedAt: string;
    shipping_address: Address;
    billing_address: Address;
    different_shipping: boolean;
    products: Product[];
    total: number;
    shipping: { name: string; cost: number };
    payment: { name: string; cost: number };
    status: string;
    comments: { date: string; type: string; comment: string };
    isInvoice: boolean;
    trackingNumber?: string;
}

interface OrdersResponse {
    orders: Order[];
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        const config = {
            'Ολοκληρωμένη': {
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: '✅'
            },
            'Σε Επεξεργασία': {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: '⏳'
            },
            'Ακυρωμένη': {
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                icon: '❌'
            },
            'Αποστολή': {
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                icon: '🚚'
            }
        };

        return config[status as keyof typeof config] || {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: '📦'
        };
    };

    const { color, icon } = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            <span className="mr-1">{icon}</span>
            {status}
        </span>
    );
};

// Product Image Component
const ProductImage = ({ product }: { product: Product }) => {
    if (product.image && product.image.url) {
        return (
            <Image
                width={64}
                height={64}
                src={product.image.formats?.small?.url ? getStrapiMedia(product.image.formats.small.url)! : getStrapiMedia(product.image.url)!}
                alt={product.name}
                className="rounded-lg object-cover border"
                placeholder="blur"
                blurDataURL={product.image.formats?.small?.url ? getStrapiMedia(product.image.formats.small.url)! : getStrapiMedia(product.image.url)!}
            />
        );
    }

    return (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border">
            <FaRegImage className="text-2xl text-gray-400" />
        </div>
    );
};

// Order Accordion Component
const OrderAccordion = ({ order }: { order: Order }) => {
    const [isOpen, setIsOpen] = useState(false);
    const orderDate = new Date(order.createdAt);

    const productsCost = order.products.reduce((total, item) =>
        total + (item.sale_price || item.price) * item.quantity, 0
    );

    const canCancel = !['Ολοκληρωμένη', 'Ακυρωμένη'].includes(order.status);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
            {/* Order Header */}
            <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="lg:col-span-1 flex items-center">
                    {isOpen ?
                        <FaCaretUp className="text-siteColors-purple text-lg" /> :
                        <FaCaretDown className="text-gray-400 text-lg" />
                    }
                </div>

                <div className="lg:col-span-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">Ημερομηνία</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {orderDate.toLocaleDateString('el-GR')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {orderDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">Αρ. Παραγγελίας</div>
                    <div className="font-mono font-semibold text-siteColors-purple dark:text-siteColors-lightblue">
                        #{order.id}
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">Tracking</div>
                    <div className="flex items-center text-sm">
                        {order.trackingNumber || order.status === 'Ολοκληρωμένη' ? (
                            <>
                                <FaTruck className="mr-2 text-blue-500" />
                                <span className="font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                    {order.trackingNumber}
                                </span>
                            </>
                        ) : (
                            <span className="text-gray-400 flex items-center">
                                <FaBox className="mr-2" />
                                Σε προετοιμασία
                            </span>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">Κατάσταση</div>
                    <StatusBadge status={order.status} />
                </div>

                <div className="lg:col-span-2 flex justify-end">
                    <button
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${canCancel
                            ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 hover:scale-105'
                            : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        disabled={!canCancel}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaRegTrashCan className="mr-2" />
                        <span className="hidden lg:inline">Ακύρωση</span>
                    </button>
                </div>
            </div>

            {/* Order Details */}
            {isOpen && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Billing Address */}
                        <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                                <FaReceipt className="mr-2 text-siteColors-purple" />
                                Χρέωση {!order.different_shipping && '- Αποστολή'}
                            </h3>
                            <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                                {order.isInvoice ? (
                                    <>
                                        <div className="font-medium">{order.billing_address.companyName}</div>
                                        <div>{order.billing_address.businessActivity}</div>
                                        <div>Α.Φ.Μ: {order.billing_address.afm}</div>
                                        <div>Δ.Ο.Υ: {order.billing_address.doy}</div>
                                    </>
                                ) : (
                                    <div className="font-medium">
                                        {order.billing_address.firstname} {order.billing_address.lastname}
                                    </div>
                                )}
                                <div>{order.billing_address.street}, {order.billing_address.city}</div>
                                <div>{order.billing_address.state}, Τ.Κ: {order.billing_address.zipCode}</div>
                                <div>{order.billing_address.country}</div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.different_shipping && (
                            <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                                    <FaTruck className="mr-2 text-siteColors-purple" />
                                    Αποστολή
                                </h3>
                                <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                                    <div className="font-medium">
                                        {order.shipping_address.firstname} {order.shipping_address.lastname}
                                    </div>
                                    <div>{order.shipping_address.street}, {order.shipping_address.city}</div>
                                    <div>{order.shipping_address.state}, Τ.Κ: {order.shipping_address.zipCode}</div>
                                    <div>{order.shipping_address.country}</div>
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Σύνοψη Παραγγελίας</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Προϊόντα:</span>
                                    <span className="font-medium">{order.products.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Τιμολόγιο:</span>
                                    <span className={order.isInvoice ? "text-green-600 font-medium" : "text-gray-600"}>
                                        {order.isInvoice ? "Ναι" : "Όχι"}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span className="font-semibold">Σύνολο:</span>
                                    <span className="font-bold text-lg text-siteColors-purple dark:text-siteColors-lightblue">
                                        {order.total.toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-6">
                        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                            <FaBox className="mr-2 text-siteColors-purple" />
                            Προϊόντα ({order.products.length})
                        </h3>

                        <div className="space-y-4">
                            {order.products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <ProductImage product={product} />

                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <span>Κωδικός: {product.id}</span>
                                                <span>Ποσότητα: {product.quantity}</span>
                                                <span>Τιμή: {(product.sale_price || product.price).toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold text-lg text-siteColors-purple dark:text-siteColors-lightblue">
                                            {((product.sale_price || product.price) * product.quantity).toFixed(2)} €
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Totals */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-end">
                                <div className="w-80 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Υποσύνολο:</span>
                                        <span>{productsCost.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{order.shipping.name}:</span>
                                        <span>{order.shipping.cost.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{order.payment.name}:</span>
                                        <span>{order.payment.cost.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <span className="flex items-center">
                                            <FaEuroSign className="mr-1 text-siteColors-purple" />
                                            Σύνολο:
                                        </span>
                                        <span className="text-siteColors-purple dark:text-siteColors-lightblue">
                                            {order.total.toFixed(2)} €
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main UserOrders Component
const UserOrders = ({ jwt }: { jwt: string }) => {
    const { data, loading, error }: { data: OrdersResponse, loading: boolean, error: any } = useApiRequest({ method: "GET", api: "/api/user-address/getUserOrders", jwt })

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-siteColors-purple mr-3" />
                <span className="text-gray-600 dark:text-gray-300">Φόρτωση παραγγελιών...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    Σφάλμα φόρτωσης παραγγελιών. Παρακαλώ δοκιμάστε ξανά αργότερα.
                </div>
            </div>
        );
    }

    if (!data?.orders || data.orders.length === 0) {
        return (
            <div className="text-center py-12">
                <FaBox className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Δεν βρέθηκαν παραγγελίες
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                    Οι μελλοντικές παραγγελίες σας θα εμφανίζονται εδώ.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Οι παραγγελίες μου
                </h2>
                <span className="bg-siteColors-purple text-white px-3 py-1 rounded-full text-sm font-medium">
                    {data.orders.length} παραγγελίες
                </span>
            </div>

            {/* Desktop Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-100 dark:bg-gray-750 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="col-span-1"></div>
                <div className="col-span-2">Ημερομηνία</div>
                <div className="col-span-2">Αρ. Παραγγελίας</div>
                <div className="col-span-3">Tracking</div>
                <div className="col-span-2">Κατάσταση</div>
                <div className="col-span-2">Ενέργειες</div>
            </div>

            {/* Orders List */}
            <div>
                {data.orders.map((order) => (
                    <OrderAccordion key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};

export default UserOrders;