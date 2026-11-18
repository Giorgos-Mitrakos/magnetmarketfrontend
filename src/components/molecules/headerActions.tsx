"use client"

import { FaOpencart } from "react-icons/fa";
import IconLink from "@/components/atoms/iconLink"
import dynamic from 'next/dynamic'
import { signIn, useSession } from "next-auth/react"
// import { useCart } from "@/context/cart";
import Minicart from "../organisms/minicart";
import { useCheckout } from "@/context/checkout";
import { trackCartIconClick } from "@/lib/helpers/advanced-analytics";
import WishlistHeaderLink from "@/components/atoms/WishlistHeaderLink";
import AccountMenu from "./AccountMenu";

const SearchInput = dynamic(() => import('./searchInput'), { ssr: false })


// export interface Props {
//     icon: React.ReactNode;
//     url: string
// }

const HeaderActions = ({ user }: any) => {

    const { data: session, status } = useSession()

    const { checkout } = useCheckout()

    return (
        <div className="hidden place-self-end lg:flex lg:flex-col h-full w-56">
            {status !== "loading" && <div className="flex flex-row-reverse w-full justify-between xs:grid xs:grid-cols-[auto_1fr] xs:gap-1">
                {/* Μενού λογαριασμού (λογαριασμός, παραγγελίες, αγαπημένα, αποσύνδεση) */}
                <AccountMenu user={user} />
                <div className="flex justify-start items-center">
                    {/* <SearchInput /> */}
                    <WishlistHeaderLink
                        className="text-siteColors-purple dark:text-slate-200 text-xl p-3 xs:text-2xl sm:p-4 md:text-3xl"
                        badgeClassName="top-1 right-0"
                    />
                    <div className="inline-flex items-center group relative">
                        <IconLink
                            icon={<FaOpencart
                                className=" dark:text-slate-200"
                                aria-label="Καλάθι" />}
                            url='/shopping-cart'
                            aria-label="Το καλάθι σου!"
                            onClick={() => trackCartIconClick('header')}
                        />
                        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full top-1 right-1 dark:border-gray-900">
                            {checkout.cart.reduce((previousValue, currentValue, currentIndex) => {
                                return previousValue + currentValue.quantity
                            }, 0)}
                        </div>
                    </div>
                </div>
            </div>}
            <p className=" text-xs font-semibold text-siteColors-purple dark:text-slate-200 pr-2"
                aria-label="Όνομα συνδεδεμένου λογαριασμού">
                {user ? <span className="block truncate" title={user}>Γεια σου, {user}!</span> :
                    <button className="uppercase text-xs font-semibold text-siteColors-purple dark:text-slate-200"
                        onClick={() => signIn()} aria-label="Σύνδεση">Είσοδος</button>}
            </p>
            {/* <div className="absolute w-full">
                <Minicart />
            </div> */}
        </div>
    )
}

export default HeaderActions