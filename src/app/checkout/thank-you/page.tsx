import Banks from "@/components/atoms/banks";
import ClearCartItems from "@/components/atoms/clearCart";
import BestPriceOrderTracking from "@/components/atoms/bestPriceOrderTracking"
import { getCookies } from "@/lib/helpers/actions"
import { Metadata } from "next"
import Image from "next/image"
import { FaRegImage, FaCheckCircle, FaTruck, FaCreditCard, FaCalendarAlt, FaEuroSign, FaExclamationTriangle } from "react-icons/fa";
import { getOrder } from "@/lib/queries/order";
import { IOrder } from "@/lib/interfaces/order";

// Function to Add days to current date
function addDays(date: Date, days: number) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

export interface IOrderCookie {
    orderId: number
}



export default async function Success() {

    const orderCookie = await getCookies({ name: '_mmo' })

    const ApprovalCodeCookie = await getCookies({ name: '_apc' })

    const order: IOrderCookie = orderCookie ? JSON.parse(orderCookie.value) : null

    const approvalCode = ApprovalCodeCookie ? JSON.parse(ApprovalCodeCookie.value) : null

    const result = await getOrder(order.orderId)

    const { order: data, deliverydays } = result as IOrder

    if (!order || !deliverydays) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-siteColors-lightblue/10 via-siteColors-blue/10 to-siteColors-pink/10 mb-16 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white text-center">
                            <h2 className="text-xl font-semibold">Προέκυψε Σφάλμα</h2>
                        </div>
                        <div className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-amber-100 p-4 rounded-full">
                                    <FaExclamationTriangle className="h-16 w-16 text-amber-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Κάτι πήγε στραβά με την παραγγελία σας
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Δεν μπορέσαμε να βρούμε τις λεπτομέρειες της παραγγελίας σας.
                                Αυτό μπορεί να οφείλεται σε τεχνικό πρόβλημα ή λάθος αναφοράς.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <p className="text-blue-800 font-medium">
                                    Μην ανησυχείτε! Εάν έχετε λάβει email επιβεβαίωσης, η παραγγελία σας έχει καταχωρηθεί επιτυχώς.
                                </p>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700 mb-6">
                                <p>Εάν έχετε οποιαδήποτε απορία, μη διστάσετε να επικοινωνήσετε μαζί μας:</p>
                                <p className="font-medium">Τηλέφωνο: 2221121657</p>
                                <p className="font-medium">Email: info@magnetmarket.gr</p>
                            </div>
                            <a
                                href="/"
                                className="inline-block bg-siteColors-purple hover:bg-siteColors-purple/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                Επιστροφή στην Αρχική Σελίδα
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const earlyDeviveryDate = new Date(deliverydays.early)
    const lateDeviveryDate = new Date(deliverydays.late)

    const orderDetails = {
        orderId: data.id,
        revenue: data.total,
        shipping: data.shipping.cost,
        tax: data.total * 0.24,
        currency: 'euro',
    };

    const products = data.products.map(product => {
        return {
            orderId: data.id,
            productId: product.id,
            title: product.name,
            price: product.is_sale && product.sale_price ? product.sale_price : product.price,
            quantity: product.quantity
        }
    })

    return (
        <>
            <ClearCartItems />
            <div className="min-h-screen bg-gradient-to-br from-siteColors-lightblue/10 via-siteColors-blue/10 to-siteColors-pink/10 mb-16 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaCheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-siteColors-purple dark:text-slate-100 mb-2">
                            Ευχαριστούμε για την παραγγελία!
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-slate-200">
                            Η παραγγελία σας έχει επιβεβαιωθεί και βρίσκεται σε επεξεργασία
                        </p>
                        {approvalCode && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
                                <p className="text-blue-800">
                                    Κωδικός έγκρισης: <span className="font-bold">{approvalCode.ApprovalCode}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                        {/* Order Summary */}
                        <div className="bg-gradient-to-r from-siteColors-lightblue to-siteColors-pink p-4 text-white">
                            <h2 className="text-xl font-semibold">
                                Περίληψη Παραγγελίας <span className="font-normal">#{data.id}</span>
                            </h2>
                        </div>

                        {/* Products Grid */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Προϊόντα</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data && data.products.map(item => (
                                    <div key={item.id} className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            {
                                                item.image.formats ? (
                                                    <Image
                                                        className="object-cover"
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.image.formats.small ? item.image.formats.small.url : item.image.url}`}
                                                        alt={item.name}
                                                        fill
                                                    />
                                                )
                                                    : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            <FaRegImage className='h-8 w-8 text-gray-400' />
                                                        </div>
                                                    )}
                                        </div>
                                        <div className="p-3 flex-grow">
                                            <h3 className="font-medium text-siteColors-purple line-clamp-2">{item.name}</h3>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p>Κωδικός: {item.id}</p>
                                                <p>Ποσότητα: {item.quantity}</p>
                                                <p className="font-semibold mt-1">
                                                    {(item.is_sale && item.sale_price ? item.sale_price : item.price).toFixed(2)} €
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Λεπτομέρειες Παραγγελίας</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="bg-siteColors-lightblue/10 p-2 rounded-full mr-3">
                                            <FaCreditCard className="text-siteColors-lightblue" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Τρόπος Πληρωμής</h4>
                                            <p className="text-gray-600">{data.payment.name}</p>
                                            {data.installments > 1 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Αριθμός δόσεων: {data.installments}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-siteColors-pink/10 p-2 rounded-full mr-3">
                                            <FaTruck className="text-siteColors-pink" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Τρόπος Αποστολής</h4>
                                            <p className="text-gray-600">{data.shipping.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="bg-siteColors-blue/10 p-2 rounded-full mr-3">
                                            <FaCalendarAlt className="text-siteColors-blue" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Εκτιμώμενη Παράδοση</h4>
                                            <p className="text-gray-600">
                                                {earlyDeviveryDate.toLocaleDateString("el-GR")} - {lateDeviveryDate.toLocaleDateString("el-GR")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-siteColors-purple/10 p-2 rounded-full mr-3">
                                            <FaEuroSign className="text-siteColors-purple" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Σύνολο</h4>
                                            <p className="text-xl font-bold text-siteColors-purple">
                                                {data.total.toFixed(2)} €
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    {data.payment.name === "Τραπεζική κατάθεση" && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                            <div className="bg-gradient-to-r from-siteColors-lightblue to-siteColors-pink p-4 text-white">
                                <h2 className="text-xl font-semibold">Τραπεζικοί Λογαριασμοί</h2>
                            </div>
                            <div className="p-6">
                                <Banks />
                            </div>
                        </div>
                    )}

                    {/* Tracking Component */}
                    <BestPriceOrderTracking orderDetails={orderDetails} products={products} />
                </div>
            </div>
        </>
    )
}

export const metadata: Metadata = {
    title: 'Magnetmarket - Ευχαριστούμε για την παραγγελία',
    description: 'Μην το ψάχνεις, εδώ θα βρείς τις καλύτερες τίμες και προσφορές σε υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις και άλλα προϊόντα.',
    keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
    alternates: {
        canonical: `${process.env.NEXT_URL}/checkout/confirm/success`,
    },
    openGraph: {
        url: 'magnetmarket.gr/checkout/thank-you',
        type: 'website',
        images: [`${process.env.NEXT_URL}/MARKET MAGNET-LOGO.svg`],
        siteName: "www.magnetmarket.gr",
        emails: ["info@magnetmarket.gr"],
        phoneNumbers: ['2221121657'],
        countryName: 'Ελλάδα',
    }
}