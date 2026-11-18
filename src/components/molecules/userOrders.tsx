'use client'
// «Οι παραγγελίες μου» (2026-10-26)
// - Πρόοδος παραγγελίας (καταχώρηση → επεξεργασία → αποστολή → παράδοση)
// - Σύνδεσμος παρακολούθησης της αποστολής
// - Τραπεζική κατάθεση σε εκκρεμότητα: ποσό, αιτιολογία και λογαριασμοί
// - Κόστη με εκπτώσεις (πακέτου / κουπονιού), ίδια με τη σελίδα «Ευχαριστούμε»
// Το παλιό κουμπί «Ακύρωση» αφαιρέθηκε: δεν έκανε τίποτα.

import { useAccount } from "@/hooks/useAccount";
import { useState } from "react";
import Link from "next/link";
import { FaRegImage, FaTruck, FaReceipt, FaBox, FaChevronDown } from "react-icons/fa";
import { getStrapiMedia } from "@/repositories/medias";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Banks from "@/components/atoms/banks";

interface Address {
    firstname: string;
    lastname: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    afm: string;
    doy: string;
    companyName: string;
    businessActivity: string;
}

interface OrderLine {
    id: string;
    name: string;
    slug: string;
    image: { url: string } | null;
    price: number;
    sale_price: number;
    quantity: number;
}

interface Order {
    id: string;
    createdAt: string;
    status: string;
    statusCode?: string;
    total: number;
    subtotal?: number | null;
    discount?: number;
    bundleDiscount?: number;
    shipping: { name: string; cost: number };
    payment: { name: string; cost: number; method?: string | null };
    paymentStatus?: string | null;
    isInvoice: boolean;
    different_shipping: boolean;
    trackingNumber?: string;
    trackingUrl?: string;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    billing_address: Address | null;
    shipping_address: Address | null;
    products: OrderLine[];
}

const euro = (v: number) => `${(Number(v) || 0).toFixed(2).replace('.', ',')} €`
const fmtDate = (s?: string | null) =>
    s ? new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Athens' }).format(new Date(s)) : ''
const unit = (p: OrderLine) => (p.sale_price || p.price)

const STOPPED = ['cancelled', 'refunded', 'failed']

const BADGE: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    payment_pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    refunded: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
}

/** Τι βλέπει ο πελάτης ως κατάσταση (με αποστολή/παράδοση όταν τις ξέρουμε) */
function customerStatus(o: Order): string {
    const code = o.statusCode ?? ''
    if (STOPPED.includes(code)) return o.status
    if (o.deliveredAt) return 'Παραδόθηκε'
    if (o.shippedAt || o.trackingNumber) return 'Στάλθηκε'
    return o.status
}

/**
 * 0 καταχώρηση · 1 επεξεργασία · 2 αποστολή
 * (2026-10-28) Χωρίς βήμα «Παραδόθηκε»: δεν καταγράφουμε παραδόσεις (για την παράδοση ο
 * πελάτης έχει τον σύνδεσμο παρακολούθησης της courier). Αν αργότερα έρχεται αυτόματα από
 * το API της courier, προστίθεται ξανά εδώ και στο STEPS.
 */
function stepOf(o: Order): number {
    if (o.shippedAt || o.trackingNumber || o.statusCode === 'completed') return 2
    if (o.statusCode === 'confirmed' || o.statusCode === 'processing') return 1
    return 0
}

const STEPS = ['Καταχωρήθηκε', 'Σε επεξεργασία', 'Στάλθηκε']

function Progress({ order }: { order: Order }) {
    const step = stepOf(order)
    return (
        <ol className="grid grid-cols-3 gap-1" aria-label="Πρόοδος παραγγελίας">
            {STEPS.map((label, i) => (
                <li key={label} className="text-center">
                    <div className={`h-1.5 rounded-full ${i <= step ? 'bg-siteColors-purple' : 'bg-gray-200 dark:bg-gray-600'}`} />
                    <div className={`mt-1 text-[11px] sm:text-xs ${i <= step ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400'}`}>
                        {label}
                    </div>
                </li>
            ))}
        </ol>
    )
}

function AddressBlock({ title, icon, a, invoice }: { title: string; icon: React.ReactNode; a: Address | null; invoice?: boolean }) {
    if (!a) return null
    const person = [a.firstname, a.lastname].filter(Boolean).join(' ')
    return (
        <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">{icon}{title}</h4>
            <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                {invoice ? (
                    <>
                        <div className="font-medium">{a.companyName}</div>
                        {a.businessActivity && <div>{a.businessActivity}</div>}
                        <div>Α.Φ.Μ. {a.afm}{a.doy ? ` · Δ.Ο.Υ. ${a.doy}` : ''}</div>
                        {person && <div>{person}</div>}
                    </>
                ) : (
                    person && <div className="font-medium">{person}</div>
                )}
                <div>{a.street}</div>
                <div>{[a.zipCode, a.city, a.state].filter(Boolean).join(', ')}</div>
            </div>
        </div>
    )
}

function OrderCard({ order }: { order: Order }) {
    const [open, setOpen] = useState(false)
    const code = order.statusCode ?? ''
    const isBank = order.payment.method === 'bank_transfer' || order.payment.name === 'Τραπεζική κατάθεση'
    const awaitingDeposit = isBank && code === 'payment_pending'
    const itemsCount = order.products.reduce((n, p) => n + (p.quantity || 0), 0)
    const productsCost = order.subtotal ?? order.products.reduce((t, p) => t + unit(p) * p.quantity, 0)
    const bundle = order.bundleDiscount ?? 0
    const coupon = Math.max(0, (order.discount ?? 0) - bundle)
    const detailsId = `order-${order.id}-details`

    const costLines = [
        { label: 'Προϊόντα', value: productsCost },
        bundle > 0 ? { label: 'Έκπτωση πακέτου', value: -bundle } : null,
        coupon > 0 ? { label: 'Έκπτωση κουπονιού', value: -coupon } : null,
        { label: order.shipping.name ? `Αποστολή (${order.shipping.name})` : 'Αποστολή', value: order.shipping.cost },
        order.payment.cost ? { label: order.payment.name ? `Πληρωμή (${order.payment.name})` : 'Πληρωμή', value: order.payment.cost } : null,
    ].filter(Boolean) as { label: string; value: number }[]

    return (
        <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls={detailsId}
                className="w-full text-left p-4 sm:p-5 pb-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Παραγγελία #{order.id}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {fmtDate(order.createdAt)} · {itemsCount} {itemsCount === 1 ? 'προϊόν' : 'προϊόντα'}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${BADGE[code] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                            {customerStatus(order)}
                        </span>
                        <span className="font-bold text-siteColors-purple dark:text-siteColors-lightblue whitespace-nowrap">{euro(order.total)}</span>
                        <FaChevronDown className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
                    </div>
                </div>
            </button>

            <div className="px-4 sm:px-5 pb-4">
                {/* Μικρογραφίες προϊόντων */}
                <div className="flex gap-2 overflow-hidden">
                    {order.products.slice(0, 5).map((p) => (
                        <Thumb key={p.id} line={p} size={44} />
                    ))}
                    {order.products.length > 5 && (
                        <span className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center">
                            +{order.products.length - 5}
                        </span>
                    )}
                </div>

                {!STOPPED.includes(code) && (
                    <div className="mt-4">
                        <Progress order={order} />
                    </div>
                )}
            </div>

            {/* Χρήσιμα χωρίς άνοιγμα: παρακολούθηση / κατάθεση */}
            {(order.trackingNumber || awaitingDeposit) && (
                <div className="px-4 sm:px-5 pb-4 space-y-3">
                    {order.trackingNumber && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <FaTruck className="text-blue-500" aria-hidden />
                            <span className="text-gray-600 dark:text-gray-300">Αριθμός αποστολής:</span>
                            <span className="font-mono font-semibold">{order.trackingNumber}</span>
                            {order.trackingUrl && (
                                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                                    className="ml-auto px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                                    Παρακολούθηση
                                </a>
                            )}
                        </div>
                    )}
                    {awaitingDeposit && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-sm">
                            <p className="font-semibold text-amber-900 dark:text-amber-200">Περιμένουμε την κατάθεσή σας</p>
                            <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
                                Ποσό <strong>{euro(order.total)}</strong> · Αιτιολογία <strong>Αριθμός παραγγελίας {order.id}</strong>
                            </p>
                            <div className="mt-3 rounded-lg bg-white p-3">
                                <Banks />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {open && (
                <div id={detailsId} className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 space-y-5">
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {order.products.map((p) => (
                            <li key={p.id} className="flex items-center gap-3 py-3">
                                <Thumb line={p} size={56} />
                                <div className="min-w-0 flex-1">
                                    {p.slug ? (
                                        <Link href={`/product/${p.slug}`} className="font-medium text-gray-900 dark:text-white hover:underline line-clamp-2">
                                            {p.name}
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-gray-900 dark:text-white line-clamp-2">{p.name}</span>
                                    )}
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {p.quantity} × {euro(unit(p))}
                                    </div>
                                </div>
                                <div className="font-semibold whitespace-nowrap">{euro(unit(p) * p.quantity)}</div>
                            </li>
                        ))}
                    </ul>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-4">
                            <AddressBlock
                                title={order.isInvoice ? 'Τιμολόγιο' : (order.different_shipping ? 'Χρέωση' : 'Χρέωση & αποστολή')}
                                icon={<FaReceipt className="text-siteColors-purple" aria-hidden />}
                                a={order.billing_address}
                                invoice={order.isInvoice}
                            />
                            {order.different_shipping && (
                                <AddressBlock title="Αποστολή" icon={<FaTruck className="text-siteColors-purple" aria-hidden />} a={order.shipping_address} />
                            )}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg text-sm space-y-2 h-fit">
                            {costLines.map((l) => (
                                <div key={l.label} className="flex justify-between gap-3">
                                    <span className="text-gray-600 dark:text-gray-300">{l.label}</span>
                                    <span>{euro(l.value)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-base font-bold">
                                <span>Σύνολο</span>
                                <span className="text-siteColors-purple dark:text-siteColors-lightblue">{euro(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Για αλλαγή ή ακύρωση της παραγγελίας επικοινωνήστε μαζί μας αναφέροντας τον αριθμό #{order.id}.
                    </p>
                </div>
            )}
        </article>
    )
}

function Thumb({ line, size }: { line: OrderLine; size: number }) {
    const src = line.image?.url ? getStrapiMedia(line.image.url) : null
    const style = { width: size, height: size }
    if (!src) {
        return (
            <span style={style} className="shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FaRegImage className="text-gray-400" aria-hidden />
            </span>
        )
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={line.name} style={style} loading="lazy" className="shrink-0 rounded-lg object-contain bg-white border border-gray-100" />
}

const UserOrders = (_props: { jwt?: string }) => {
    const { data, loading, error, mutate } = useAccount<{ orders: Order[] }>('orders')

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12" role="status">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-siteColors-purple mr-3" />
                <span className="text-gray-600 dark:text-gray-300">Φόρτωση παραγγελιών...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                <p>Δεν φορτώθηκαν οι παραγγελίες σας.</p>
                <button type="button" onClick={() => mutate()} className="mt-3 underline font-semibold">Δοκιμάστε ξανά</button>
            </div>
        )
    }

    const orders = data?.orders ?? []
    if (!orders.length) {
        return (
            <div className="text-center py-12">
                <FaBox className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Δεν έχετε παραγγελίες ακόμα</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Παραγγελίες που κάνατε ως επισκέπτης με το ίδιο email θα εμφανιστούν εδώ μόλις επιβεβαιωθεί ο λογαριασμός σας.
                </p>
                <Link href="/" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold">
                    Συνέχεια αγορών
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Οι παραγγελίες μου</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{orders.length} {orders.length === 1 ? 'παραγγελία' : 'παραγγελίες'}</span>
            </div>
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    )
}

export default UserOrders
