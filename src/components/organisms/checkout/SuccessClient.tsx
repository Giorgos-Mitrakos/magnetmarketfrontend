// (2026-10-25) «Ευχαριστούμε»: αριθμός παραγγελίας και email πάνω-πάνω, μήνυμα ανάλογα με
// την πληρωμή (κατάθεση / αντικαταβολή / κάρτα), οδηγίες κατάθεσης με ποσό και αιτιολογία,
// ανάλυση κόστους, ημερομηνίες με ημέρα, newsletter μετά τα στοιχεία της παραγγελίας.
import Banks from "@/components/atoms/banks";
import BestPriceOrderTracking from "@/components/atoms/bestPriceOrderTracking"
import { Metadata } from "next"
import Image from "next/image"
import { FaRegImage, FaCheckCircle, FaTruck, FaCreditCard, FaCalendarAlt, FaEuroSign, FaExclamationTriangle } from "react-icons/fa";
import { getOrder } from "@/lib/queries/order";
import { IOrder } from "@/lib/interfaces/order";
import PurchaseTracker from "@/components/molecules/PurchaseTracker";
import PostPurchaseNewsletter from "@/components/molecules/PostPurchaseNewsletter";
import PostPurchaseAccount from "@/components/molecules/PostPurchaseAccount";
import GoogleCustomerReviews from "@/components/organisms/checkout/GoogleCustomerReviews";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

/** Εικόνα γραμμής παραγγελίας: σχετικό URL του Strapi ή πλήρες URL */
const orderImageUrl = (url: string) => /^https?:\/\//i.test(url) ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`


export interface IOrderCookie {
    /** documentId της παραγγελίας (Strapi v3) */
    orderId: string
}

export default async function SuccessClient({ orderCookie, ApprovalCodeCookie }:
    { orderCookie: RequestCookie | undefined, ApprovalCodeCookie: RequestCookie | undefined }) {

    const order: IOrderCookie = orderCookie ? JSON.parse(orderCookie.value) : null
    const approvalCode = ApprovalCodeCookie ? JSON.parse(ApprovalCodeCookie.value) : null

    const result = order ? await getOrder(order?.orderId) : null
    const { order: data, deliverydays } = (result ?? {}) as Partial<IOrder>

    if (!order || !data || !deliverydays) {
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

    // ✅ Data για Google Analytics tracking
    const orderDataForGATracking = {
        id: data.id,
        total: data.total,
        vatTotal: data.vatTotal,
        shipping: {
            cost: data.shipping.cost
        },
        products: data.products
    };

    // Data για BestPrice tracking
    const orderDetailsForBestPrice = {
        orderId: data.id,
        revenue: data.total,
        shipping: data.shipping.cost,
        // ΦΠΑ από την παραγγελία (17% στα νησιά)· παλιές απαντήσεις χωρίς vatTotal: 24% μέσα στο σύνολο
        tax: data.vatTotal ?? Math.round((data.total * 24 / 124) * 100) / 100,
        currency: 'euro',
    };

    const productsForBestPrice = data.products.map(product => ({
        orderId: data.id,
        productId: product.id,
        title: product.name,
        price: product.is_sale && product.sale_price ? product.sale_price : product.price,
        quantity: product.quantity
    }));

    // ✅ Extract user email from order
    const userEmail = data.billing_address.email || undefined;

    // ✅ Google Customer Reviews: η Google στέλνει το ερωτηματολόγιο μετά από αυτή την ημερομηνία.
    // (2026-10-24) Η πιο αργή εκτίμηση παράδοσης του Strapi (ίδιος υπολογισμός με τη σελίδα
    // προϊόντος: ώρα αποκοπής, χρόνος προμηθευτή, περιθώριο), ως ημερομηνία Ελλάδας «ΕΕΕΕ-ΜΜ-ΗΗ».
    const googleDeliveryDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Athens' }).format(lateDeviveryDate);

    // ✅ Prepare products με GTINs/MPNs για Google
    // Χρησιμοποιούμε barcode (προτεραιότητα) ή mpn (fallback)
    const productsWithGTIN = data.products
        .map(p => {
            const identifier = p.barcode || p.mpn;
            return identifier ? { gtin: identifier.toString() } : null;
        })
        .filter((p): p is { gtin: string } => p !== null); // Remove nulls

    // (2026-10-25) Μήνυμα ανάλογα με τον τρόπο πληρωμής / αποστολής
    const method = data.payment.method
    const isBankTransfer = method === "bank_transfer" || data.payment.name === "Τραπεζική κατάθεση"
    const isCashOnDelivery = method === "cash_on_delivery" || method === "cash"
    const isCard = method === "credit_card" || method === "debit_card" || method === "iris_payment"
    const isPickup = /παραλαβ/i.test(String(data.shipping.name ?? ''))
    const fmtDay = (d: Date) =>
        new Intl.DateTimeFormat("el-GR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Athens" }).format(d)
    const sameDay = fmtDay(earlyDeviveryDate) === fmtDay(lateDeviveryDate)
    const deliveryText = sameDay ? fmtDay(earlyDeviveryDate) : `${fmtDay(earlyDeviveryDate)} – ${fmtDay(lateDeviveryDate)}`
    const euro = (v: number) => `${v.toFixed(2).replace(".", ",")} €`
    const unit = (p: { is_sale: boolean, sale_price: number | null, price: number }) => (p.is_sale && p.sale_price ? p.sale_price : p.price)

    const subtitle = isBankTransfer
        ? "Η παραγγελία καταχωρήθηκε. Θα την ετοιμάσουμε μόλις λάβουμε την κατάθεσή σας."
        : isCard
            ? "Η πληρωμή ολοκληρώθηκε και η παραγγελία σας βρίσκεται σε επεξεργασία."
            : isCashOnDelivery
                ? "Η παραγγελία καταχωρήθηκε. Θα πληρώσετε κατά την παραλαβή."
                : "Η παραγγελία σας καταχωρήθηκε και βρίσκεται σε επεξεργασία."

    const costLines = [
        { label: "Προϊόντα", value: data.subtotal ?? null },
        { label: "Έκπτωση", value: data.discount ? -data.discount : null },
        { label: data.shipping.name ? `Αποστολή (${data.shipping.name})` : "Αποστολή", value: data.shipping.cost },
        { label: data.payment.name ? `Πληρωμή (${data.payment.name})` : "Πληρωμή", value: data.payment.cost || null },
    ].filter((l) => l.value != null)

    return (
        <>
            {/* ✅ TRACKING COMPONENTS */}
            <PurchaseTracker
                orderData={orderDataForGATracking}
                appliedCoupon={data.coupon?.code || null}
            />

            {/* ✅ GOOGLE CUSTOMER REVIEWS */}
            {userEmail && (
                <GoogleCustomerReviews
                    orderId={data.id.toString()}
                    email={userEmail}
                    deliveryCountry="GR"
                    estimatedDeliveryDate={googleDeliveryDate}
                    products={productsWithGTIN.length > 0 ? productsWithGTIN : undefined}
                />
            )}

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
                        <p className="text-lg text-gray-700 dark:text-slate-200">
                            Αριθμός παραγγελίας: <span className="font-bold">#{data.id}</span>
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-slate-300">{subtitle}</p>
                        {userEmail && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                                Στείλαμε επιβεβαίωση στο <span className="font-medium">{userEmail}</span>
                            </p>
                        )}
                        {approvalCode && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
                                <p className="text-blue-800">
                                    Κωδικός έγκρισης: <span className="font-bold">{approvalCode.ApprovalCode}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Τραπεζική κατάθεση: τι πρέπει να κάνει ο πελάτης — πρώτο */}
                    {isBankTransfer && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                            <div className="bg-gradient-to-r from-siteColors-lightblue to-siteColors-pink p-4 text-white">
                                <h2 className="text-xl font-semibold">Ολοκληρώστε την κατάθεση</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <div className="text-sm text-gray-500">Ποσό</div>
                                        <div className="text-xl font-bold text-siteColors-purple">{euro(data.total)}</div>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <div className="text-sm text-gray-500">Αιτιολογία κατάθεσης</div>
                                        <div className="text-xl font-bold text-siteColors-purple">Αριθμός παραγγελίας {data.id}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Γράψτε στην αιτιολογία «Αριθμός παραγγελίας {data.id}», ώστε να αντιστοιχίσουμε γρήγορα την πληρωμή.
                                </p>
                                <Banks />
                            </div>
                        </div>
                    )}

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
                                {data && data.products.map((item, index) => (
                                    <div key={`${item.documentId ?? item.id}-${index}`} className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative w-24 h-24 m-2 flex-shrink-0">
                                            {
                                                item.image?.formats ? (
                                                    <Image
                                                        className="object-contain"
                                                        src={orderImageUrl(item.image.formats.small ? item.image.formats.small.url : item.image.url)}
                                                        alt=""
                                                        fill
                                                        sizes="96px"
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
                                                <p>{item.quantity} × {euro(unit(item))}</p>
                                                <p className="font-semibold mt-1">{euro(unit(item) * item.quantity)}</p>
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
                                        <div className="bg-siteColors-blue/10 p-2 rounded-full mr-3">
                                            <FaCalendarAlt className="text-siteColors-blue" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">
                                                {isPickup ? "Έτοιμη για παραλαβή" : "Εκτιμώμενη παράδοση"}
                                            </h4>
                                            <p className="text-gray-600 first-letter:uppercase">{deliveryText}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {isBankTransfer
                                                    ? "από τη στιγμή που θα λάβουμε την κατάθεση"
                                                    : isPickup
                                                        ? "θα σας ειδοποιήσουμε όταν είναι έτοιμη"
                                                        : "εργάσιμες ημέρες — θα λάβετε email με τον αριθμό αποστολής"}
                                            </p>
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
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-siteColors-purple/10 p-2 rounded-full mr-3">
                                        <FaEuroSign className="text-siteColors-purple" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-700 mb-2">Κόστος</h4>
                                        <dl className="space-y-1 text-sm text-gray-600">
                                            {costLines.map((l) => (
                                                <div key={l.label} className="flex justify-between gap-4">
                                                    <dt>{l.label}</dt>
                                                    <dd className={l.value! < 0 ? "text-green-600" : ""}>
                                                        {l.value === 0 ? "Δωρεάν" : l.value! < 0 ? `− ${euro(-l.value!)}` : euro(l.value!)}
                                                    </dd>
                                                </div>
                                            ))}
                                            <div className="flex justify-between gap-4 border-t pt-2 text-base">
                                                <dt className="font-semibold text-gray-800">Σύνολο</dt>
                                                <dd className="text-xl font-bold text-siteColors-purple">{euro(data.total)}</dd>
                                            </div>
                                        </dl>
                                        {data.islandVat && (
                                            <p className="text-sm text-green-700 mt-1">
                                                Με μειωμένο ΦΠΑ {data.islandVat.rate}%
                                                {data.islandVat.area ? ` (${data.islandVat.area})` : ''}
                                                {data.vatTotal != null ? ` — ΦΠΑ ${data.vatTotal.toFixed(2)} €` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Λογαριασμός με ένα βήμα για επισκέπτες (ή σύνδεσμος στις παραγγελίες) */}
                    <PostPurchaseAccount email={userEmail} orderNumber={String(data.id)} />

                    {/* Newsletter — μετά τα στοιχεία της παραγγελίας */}
                    <div className="mb-8">
                        <PostPurchaseNewsletter userEmail={userEmail} />
                    </div>

                    <div className="text-center">
                        <a
                            href="/"
                            className="inline-block bg-siteColors-purple hover:bg-siteColors-purple/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Συνέχεια αγορών
                        </a>
                    </div>

                    {/* ✅ BestPrice Tracking */}
                    <BestPriceOrderTracking
                        orderDetails={orderDetailsForBestPrice}
                        products={productsForBestPrice}
                    />
                </div>
            </div>
        </>
    )
}
