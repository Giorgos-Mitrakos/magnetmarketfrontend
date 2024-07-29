"use client"

import { FaOpencart, FaRegHeart } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import IconLink from "@/components/atoms/iconLink"
import dynamic from 'next/dynamic'
import { signIn, signOut, useSession } from "next-auth/react"
import { useContext } from "react";
import { CartContext } from "@/context/cart";
import Minicart from "../organisms/minicart";

const SearchInput = dynamic(() => import('./searchInput'), { ssr: false })


// export interface Props {
//     icon: React.ReactNode;
//     url: string
// }

const HeaderActions = ({ user }: any) => {

    const { data: session, status } = useSession()

    const { cartItems } = useContext(CartContext)
    // console.log(session, status)
    return (
        <div className="flex h-full w-auto">
            {status !== "loading" && <div className="flex flex-row-reverse w-full justify-between xs:grid xs:grid-rows-2">
                <div className="flex justify-start items-center">
                    {/* <SearchInput /> */}
                    <IconLink icon={<FaRegHeart
                        aria-label="Καρδιά" />}
                        url='https://www.google.com'
                        aria-label="Τα αγαπημένα σου!" />
                    <div className="inline-flex items-center group">
                        <IconLink icon={<FaOpencart
                            aria-label="Καλάθι" />}
                            url='/shopping-cart'
                            aria-label={`Το καλάθι σου!`} />
                        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full top-1 right-1 dark:border-gray-900">
                            {cartItems.reduce((previousValue, currentValue, currentIndex) => { return previousValue + currentValue.quantity }, 0)}</div>
                            <Minicart />
                    </div>
                </div>
                <div className="flex flex-row group relative h-auto w-auto justify-start items-center">
                    <IconLink icon={<AiOutlineUser
                        aria-label="Άνθρωπος" />}
                        url='/login'
                        aria-label="Προφίλ" />
                    <p className=" uppercase text-xs w-min font-semibold text-siteColors-purple pr-2"
                        aria-label="Όνομα συνδεδεμένου λογαριασμού">
                        {user ? user :
                            <button className="uppercase text-xs font-semibold text-siteColors-purple"
                                onClick={() => signIn()} aria-label="Σύνδεση">Είσοδος</button>}
                    </p>
                    {user &&
                        <div className="absolute hidden group-hover:block -bottom-8 ring p-2 bg-white">
                            <button onClick={() => signOut({ callbackUrl: process.env.NEXT_URL })} aria-label="Αποσύνδεση">Sign out</button>
                        </div>}
                </div>

            </div>}
        </div>
    )
}

export default HeaderActions