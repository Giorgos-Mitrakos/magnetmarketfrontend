"use client"
// (2026-10-24) Καλάθι:
//  - μία κλήση για όλες τις γραμμές (τιμή, διαθεσιμότητα, μέγιστη ποσότητα, παράδοση)
//  - ό,τι εμποδίζει την παραγγελία φαίνεται στη γραμμή (εξαντλήθηκε, αναμένεται,
//    περισσότερα τεμάχια από τα διαθέσιμα) και το κουμπί ολοκλήρωσης κλειδώνει
//  - εκτιμώμενη παράδοση ανά προϊόν και για όλη την παραγγελία (ίδια με τη σελίδα προϊόντος)
//  - ολοκλήρωση ως επισκέπτης ή με σύνδεση, απευθείας από το καλάθι
//  - στο κινητό η σύνοψη έρχεται αμέσως μετά τα προϊόντα (πριν από τις προτάσεις)

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FaRegTrashCan } from "react-icons/fa6"

import CartSummary from "@/components/atoms/cartSummary"
import Breadcrumb from "@/components/molecules/breadcrumb"
import SiteFeatures from "@/components/organisms/siteFeatures"
import CartCrossSell from "@/components/molecules/CartCrossSell"
import RecentlyViewed from "@/components/molecules/RecentlyViewed"

import useCartLines, { cartLineKey, ICartLineInfo } from "@/hooks/useCartLines"
import { getStrapiMedia } from "@/repositories/medias"
import { ICartItem } from "@/lib/interfaces/cart"
import { trackBeginCheckout, trackViewCart } from "@/lib/helpers/analytics"
import { useCheckout } from "@/context/checkout"
import { removeItemToast } from "@/lib/toasts/cartToasts"

const CHECKOUT_URL = "/checkout/customer-informations"

const euro = (v: number) => `${v.toFixed(2).replace(".", ",")} €`

/** «Τρί 27 Οκτ» ή «Τρί 27 – Πέμ 29 Οκτ» */
function formatRange(from: string, to: string) {
    const fmt = (ymd: string) =>
        new Intl.DateTimeFormat("el-GR", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Athens" })
            .format(new Date(`${ymd}T12:00:00+03:00`))
    return from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`
}

/** Τελική τιμή μονάδας (προσφορά αν ισχύει) */
function unitPrice(price?: number | null, salePrice?: number | null, isSale?: boolean) {
    const p = Number(price) || 0
    const s = Number(salePrice) || 0
    return isSale && s > 0 && (!p || s < p) ? s : p
}

export default function CartComp() {
    const hasPageBeenRendered = useRef(false)
    const { checkout } = useCheckout()
    const { status } = useSession()
    const { byKey, delivery, canCheckout } = useCartLines(checkout.cart)

    const breadcrumbs = [
        { title: "Αρχική", slug: "/" },
        { title: "Καλάθι", slug: `/shopping-cart` }
    ]

    useEffect(() => {
        if (!checkout.cart || hasPageBeenRendered.current) return
        if (checkout.cart.length > 0 && checkout.totals.subtotal > 0) {
            trackViewCart(checkout.cart)
            hasPageBeenRendered.current = true
        }
    }, [checkout.cart, checkout.totals.subtotal])

    const count = checkout.cart.reduce((n, i) => n + i.quantity, 0)
    const isEmpty = checkout.cart.length === 0

    return (
        <div className="mb-16">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <h1 className="text-xl sm:text-3xl my-4 lg:my-8 text-center font-bold text-siteColors-purple dark:text-slate-200">
                Καλάθι αγορών
                {!isEmpty && (
                    <span className="ml-2 align-middle text-base font-medium text-slate-500 dark:text-slate-400">
                        ({count} {count === 1 ? "τεμάχιο" : "τεμάχια"})
                    </span>
                )}
            </h1>

            {isEmpty ? (
                <EmptyCart />
            ) : (
                <div className="grid lg:grid-cols-4 gap-4 items-start">
                    <section className="lg:col-span-3" aria-label="Προϊόντα στο καλάθι">
                        {checkout.cart.map((item) => (
                            <CartItemTemplate
                                key={`${item.id}-${item.preorderToken ?? ""}`}
                                item={item}
                                info={byKey.get(cartLineKey(item))}
                            />
                        ))}
                        <Link
                            href="/"
                            className="inline-block mt-1 text-sm font-medium text-siteColors-blue hover:text-siteColors-purple dark:text-slate-300"
                        >
                            ← Συνέχεια αγορών
                        </Link>
                    </section>

                    <aside className="lg:col-span-1 lg:sticky lg:top-4" aria-label="Σύνοψη παραγγελίας">
                        <div className="flex flex-col space-y-3 border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm">
                            <CartSummary />

                            {delivery && canCheckout && (
                                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
                                    🚚 Εκτιμώμενη παράδοση: <strong>{formatRange(delivery.from, delivery.to)}</strong>
                                    <span className="block text-xs opacity-80">για παραγγελία σήμερα, σε εργάσιμες ημέρες</span>
                                </div>
                            )}

                            {canCheckout ? (
                                status === "authenticated" ? (
                                    <CheckoutButton href={CHECKOUT_URL} onClick={() => trackBeginCheckout(checkout.cart)}>
                                        Ολοκλήρωση αγοράς
                                    </CheckoutButton>
                                ) : (
                                    <>
                                        <CheckoutButton href={CHECKOUT_URL} onClick={() => trackBeginCheckout(checkout.cart)}>
                                            Ολοκλήρωση αγοράς
                                        </CheckoutButton>
                                        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                                            Χωρίς λογαριασμό ή{" "}
                                            <Link
                                                href={`/login?callbackUrl=${encodeURIComponent(CHECKOUT_URL)}`}
                                                onClick={() => trackBeginCheckout(checkout.cart)}
                                                className="font-semibold text-siteColors-blue hover:text-siteColors-purple underline"
                                            >
                                                συνδεθείτε
                                            </Link>
                                            {" "}για να συμπληρωθούν τα στοιχεία σας
                                        </p>
                                    </>
                                )
                            ) : (
                                <>
                                    <span
                                        aria-disabled="true"
                                        className="flex justify-center items-center px-4 py-2 w-full rounded text-lg font-semibold bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300 cursor-not-allowed"
                                    >
                                        Ολοκλήρωση αγοράς
                                    </span>
                                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                                        Διορθώστε τα προϊόντα με την κόκκινη ένδειξη για να συνεχίσετε.
                                    </p>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {/* Προτάσεις σε όλο το πλάτος, μετά τη σύνοψη (και στο κινητό) */}
            {!isEmpty && <CartCrossSell />}

            <div className="mt-10">
                <SiteFeatures />
            </div>
        </div>
    )
}

function CheckoutButton({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            onClick={onClick}
            href={href}
            className="flex justify-center items-center px-4 py-3 w-full rounded text-lg font-semibold text-white
                bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink
                md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink"
        >
            {children}
        </Link>
    )
}

function EmptyCart() {
    return (
        <>
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">Το καλάθι σας είναι άδειο</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">Ρίξτε μια ματιά στις προσφορές ή συνεχίστε από την αρχική.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link
                        href="/offers"
                        className="inline-block px-6 py-2 bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Δείτε τις προσφορές
                    </Link>
                    <Link
                        href="/"
                        className="inline-block px-6 py-2 rounded-lg border border-siteColors-purple text-siteColors-purple hover:bg-siteColors-purple hover:text-white transition-colors dark:border-slate-300 dark:text-slate-200"
                    >
                        Αρχική σελίδα
                    </Link>
                </div>
            </div>
            <RecentlyViewed />
        </>
    )
}

const CartItemTemplate = ({ item, info }: { item: ICartItem; info?: ICartLineInfo }) => {
    const { dispatch } = useCheckout()

    // Τρέχουσα τιμή από το Strapi· μέχρι να έρθει, η τιμή που είχε όταν μπήκε στο καλάθι
    const live = info?.found && info.price != null
    const price = live ? Number(info!.price) : Number(item.price) || 0
    const salePrice = live ? info!.sale_price ?? null : item.sale_price
    const isSale = live ? !!info!.is_sale : item.is_sale
    const unit = unitPrice(price, salePrice, isSale)
    const showStrike = isSale && unit < price
    const oldUnit = unitPrice(item.price, item.sale_price, item.is_sale)
    const priceChanged = live && oldUnit > 0 && Math.abs(oldUnit - unit) >= 0.01

    const maxQty = info?.maxQty ?? item.preorderMax ?? null
    const canIncrease = maxQty == null || item.quantity < maxQty

    const handleRemoveItem = () => {
        dispatch({ type: "REMOVE_ITEM", payload: item })
        removeItemToast(item)
    }
    const handleIncreaseQuantity = () => {
        if (!canIncrease) return
        dispatch({ type: "INCREASE_ITEM_QUANTITY", payload: { item, quantity: 1 } })
    }
    const handleDecreaseQuantity = () => {
        dispatch({ type: "DECREASE_ITEM_QUANTITY", payload: { item, quantity: 1 } })
    }

    const imageUrl = item.image ? getStrapiMedia(item.image.formats?.thumbnail?.url || item.image.url) : null
    const problem = info?.problem ?? null

    return (
        <div
            className={`grid gap-y-3 gap-x-3 grid-cols-[5rem_1fr] sm:grid-cols-[6rem_1fr_auto] mb-4 p-4 border rounded-lg bg-white dark:bg-slate-800 shadow-sm ${
                problem ? "border-red-300 dark:border-red-800" : "border-slate-200 dark:border-slate-700"
            }`}
        >
            {/* Εικόνα */}
            <Link href={`/product/${item.slug}`} className="row-span-2 sm:row-span-1" tabIndex={-1} aria-hidden>
                {imageUrl ? (
                    <div className="relative h-20 w-full">
                        <Image className="object-contain object-center" fill sizes="96px" src={imageUrl} alt="" quality={75} />
                    </div>
                ) : (
                    <div className="h-20 w-full bg-slate-100 dark:bg-slate-700 rounded" />
                )}
            </Link>

            {/* Όνομα / διαθεσιμότητα */}
            <div className="flex min-w-0 flex-col gap-1">
                <Link
                    href={`/product/${item.slug}`}
                    className="text-sm lg:text-base line-clamp-2 font-semibold text-siteColors-purple hover:text-siteColors-pink dark:text-slate-200 dark:hover:text-white"
                >
                    {item.name}
                </Link>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.brand ? `${item.brand} · ` : ""}Κωδικός: {item.id}
                </span>
                <LineStatus item={item} info={info} />
                {priceChanged && !problem && (
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                        Η τιμή άλλαξε από {euro(oldUnit)} σε {euro(unit)}
                    </span>
                )}
            </div>

            {/* Τιμή / ποσότητα / σύνολο / αφαίρεση */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-between">
                <div className="flex flex-col items-start sm:items-end">
                    {showStrike && <span className="text-xs line-through text-slate-500 dark:text-slate-400">{euro(price)}</span>}
                    <span className="text-sm text-slate-600 dark:text-slate-300">{euro(unit)} / τεμ.</span>
                </div>

                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                    <button
                        onClick={handleDecreaseQuantity}
                        disabled={item.quantity <= 1}
                        className="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                        aria-label={`Μείωση ποσότητας: ${item.name}`}
                    >
                        <svg className="w-3 h-3 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                    </button>
                    <span className="h-9 w-10 flex items-center justify-center bg-white dark:bg-slate-800 font-medium text-sm text-slate-900 dark:text-white" aria-live="polite">
                        {item.quantity}
                    </span>
                    <button
                        onClick={handleIncreaseQuantity}
                        disabled={!canIncrease}
                        title={!canIncrease && maxQty != null ? `Μέγιστη ποσότητα: ${maxQty}` : undefined}
                        className="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                        aria-label={`Αύξηση ποσότητας: ${item.name}`}
                    >
                        <svg className="w-3 h-3 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-siteColors-purple dark:text-slate-100">{euro(unit * item.quantity)}</span>
                    <button
                        onClick={handleRemoveItem}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        aria-label={`Αφαίρεση: ${item.name}`}
                        title="Αφαίρεση"
                    >
                        <FaRegTrashCan className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    )
}

/** Διαθεσιμότητα / παράδοση της γραμμής — ή το πρόβλημα που εμποδίζει την παραγγελία */
function LineStatus({ item, info }: { item: ICartItem; info?: ICartLineInfo }) {
    if (!info) return null
    if (info.problem) {
        return <span className="text-sm font-semibold text-red-600 dark:text-red-400">{info.problem}</span>
    }
    if (item.preorderToken) {
        return <span className="text-sm text-amber-700 dark:text-amber-300">Προπαραγγελία — θα σας ενημερώσουμε για την παράδοση</span>
    }
    if (info.delivery) {
        return (
            <span className="text-sm text-green-700 dark:text-green-400">
                {info.delivery.source === "stock" ? "✓ Άμεσα διαθέσιμο" : "✓ Διαθέσιμο"} · παράδοση {formatRange(info.delivery.from, info.delivery.to)}
            </span>
        )
    }
    if (info.backorder) {
        return <span className="text-sm text-orange-600 dark:text-orange-400">Κατόπιν παραγγελίας — χρόνος παράδοσης κατόπιν επικοινωνίας</span>
    }
    return null
}
