import { getCookies } from "@/lib/helpers/actions"
import { IOrderCookie } from "../thank-you/page"
import Image from "next/image"
import { FaRegImage, FaTimesCircle, FaExclamationTriangle, FaEuroSign } from "react-icons/fa";
import { getOrder } from "@/lib/queries/order"

export default async function Fail() {
    const orderCookie = await getCookies({ name: '_mmo' })
    const rcfCookie = await getCookies({ name: '_rcf' })

    const order: IOrderCookie = orderCookie ? JSON.parse(orderCookie.value) : null

    const result = await getOrder(order.orderId)

    const data = result?.order

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-siteColors-lightblue/10 via-siteColors-blue/10 to-siteColors-pink/10 mb-16 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white text-center">
                            <h2 className="text-xl font-semibold">Προέκυψε Σφάλμα</h2>
                        </div>
                        <div className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-red-100 p-4 rounded-full">
                                    <FaTimesCircle className="h-16 w-16 text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Κάτι πήγε στραβά με την παραγγελία σας
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Δεν μπορέσαμε να βρούμε τις λεπτομέρειες της παραγγελίας σας.
                                Αυτό μπορεί να οφείλεται σε τεχνικό πρόβλημα ή λάθος αναφοράς.
                            </p>
                            <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
                                <p className="text-red-800 font-medium">
                                    Η πληρωμή δεν ολοκληρώθηκε με επιτυχία. Εάν έχετε χρεωθεί,
                                    η ποσό θα επιστραφεί αυτόματα στον λογαριασμό σας εντός λίγων ημερών.
                                </p>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700 mb-6">
                                <p>Εάν έχετε οποιαδήποτε απορία, μη διστάσετε να επικοινωνήσετε μαζί μας:</p>
                                <p className="font-medium">Τηλέφωνο: 2221121657</p>
                                <p className="font-medium">Email: info@magnetmarket.gr</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/cart"
                                    className="inline-block bg-siteColors-purple hover:bg-siteColors-purple/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    Επιστροφή στο Καλάθι
                                </a>
                                <a
                                    href="/"
                                    className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    Επιστροφή στην Αρχική
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    let resultAnswer = ''

    // switch (resultCode.RCF) {
    //     case 1:
    //         resultAnswer = 'H συναλλαγή δεν έγινε δεκτή από την εκδότρια Τράπεζα'
    //         break;
    //     case 2:
    //         resultAnswer = 'Αδυναμία εκτέλεσης της συναλλαγής'
    //         break;
    //     case 3:
    //         resultAnswer = 'Αδυναμία εκτέλεσης της συναλλαγής λόγω (τεχνικού) προβλήματος. Παρακαλούμε να προσπαθήσετε ξανά αργότερα'
    //         break;
    //     case 4:
    //         resultAnswer = 'Αδυναμία εκτέλεσης της συναλλαγής. Παρακαλούμε να ελέγξετε τα στοιχεία της κάρτας σας και προσπαθήστε ξανά.'
    //         break;
    //     case 5:
    //         resultAnswer = 'Αδυναμία εκτέλεσης της συναλλαγής. Παρακαλούμε να προσπαθήσετε ξανά αργότερα'
    //         break;
    //     case 6:
    //         resultAnswer = 'Αδυναμία εκτέλεσης της συναλλαγής λόγω προσωρινού τεχνικού προβλήματος. Παρακαλούμε να προσπαθήσετε ξανά αργότερα'
    //         break;
    //     default:
    //         break;
    // }

    return (
        <div className="min-h-screen bg-gradient-to-br from-siteColors-lightblue/10 via-siteColors-blue/10 to-siteColors-pink/10 mb-16 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-100 p-3 rounded-full">
                            <FaTimesCircle className="h-12 w-12 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-500 mb-2">
                        Η παραγγελία σας δεν κατάφερε να ολοκληρωθεί!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-slate-200">
                        Παρακαλούμε δοκιμάστε ξανά ή επικοινωνήστε με την υποστήριξη
                    </p>
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
                        <div className="flex items-start">
                            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-red-800">Αρ. Παραγγελίας: {order.orderId}</h3>
                                {resultAnswer && (
                                    <p className="text-red-700 mt-2">{resultAnswer}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    {/* Order Summary Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
                        <h2 className="text-xl font-semibold">
                            Προϊόντα Παραγγελίας <span className="font-normal">#{order.orderId}</span>
                        </h2>
                    </div>

                    {/* Products Grid */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data && data.products.map(item => (
                                <div key={item.id} className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        {item.image.formats ? (
                                            <Image
                                                className="object-cover"
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${item.image.formats.small ? item.image.formats.small.url : item.image.url}`}
                                                alt={item.name}
                                                fill
                                            />
                                        ) : (
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

                    {/* Order Total */}
                    <div className="border-t p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-siteColors-purple/10 p-2 rounded-full mr-3">
                                    <FaEuroSign className="text-siteColors-purple" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700">Σύνολο</h3>
                            </div>
                            <p className="text-xl font-bold text-siteColors-purple">
                                {data.total.toFixed(2)} €
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Τι μπορείτε να κάνετε τώρα;</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-siteColors-blue mb-2">Δοκιμάστε ξανά</h4>
                            <p className="text-gray-600 text-sm">Ελέγξτε τα στοιχεία πληρωμής και δοκιμάστε ξανά</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-siteColors-blue mb-2">Επικοινωνήστε μαζί μας</h4>
                            <p className="text-gray-600 text-sm">Το τηλέφωνό μας: <strong>2221121657</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}