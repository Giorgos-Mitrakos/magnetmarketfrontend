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

const HeaderActions = () => {

    // (2026-11-26) Το όνομα έρχεται από το session στον browser (πριν το έβαζε ο server στη σελίδα)
    const { data: session, status } = useSession()
    const user = session?.user?.name?.split('@')[0] || null

    const { checkout } = useCheckout()

    return (
        <div className="hidden place-self-end lg:flex lg:flex-col h-full w-56">
            {/* Πάντα ορατά (και όσο φορτώνει το session) — αλλιώς θα «πηδούσαν» μόλις έρθει */}
            <div className="flex flex-row-reverse w-full justify-between xs:grid xs:grid-cols-[auto_1fr] xs:gap-1">
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
            </div>
            {/* (2026-11-24) «Είσοδος»: αρκετά μεγάλο και με απόσταση από το εικονίδιο λογαριασμού για να πατιέται
                (PageSpeed: «Touch targets do not have sufficient size or spacing»). Χωρίς aria-label: το όνομα του
                κουμπιού είναι το ορατό κείμενο (το «Σύνδεση» δεν ταίριαζε με το «Είσοδος»). */}
            <div className="text-xs font-semibold text-siteColors-purple dark:text-slate-200 pr-2">
                {status === "loading" ? <span className="block min-h-[24px] mt-1" aria-hidden="true" /> :
                    user ? <span className="block truncate" title={user}>Γεια σου, {user}!</span> :
                    <button type="button" className="inline-flex items-center min-h-[24px] px-2 py-1 mt-1 rounded uppercase text-xs font-semibold text-siteColors-purple hover:underline dark:text-slate-200"
                        onClick={() => signIn()}>Είσοδος</button>}
            </div>
            {/* <div className="absolute w-full">
                <Minicart />
            </div> */}
        </div>
    )
}

export default HeaderActions