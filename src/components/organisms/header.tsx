'use client'
import HeaderActions from "../molecules/headerActions";
import Logo from "../atoms/logo";
import { useContext, useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";
import MainMenu from "./mainMenu";
import dynamic from "next/dynamic";
import Minicart from "./minicart";
import { ToggleMobileMenu } from "../atoms/toggleMobileMenu";
import Link from "next/link";
import { FaOpencart } from "react-icons/fa";
import { CartContext } from "@/context/cart";
import { MenuContext } from "@/context/menu";
// import { ToggleMobileMenu } from './toggleMobileMenu'

const SearchInput = dynamic(() => import('@/components/molecules/searchInput'), {
    ssr: false,
    loading: () => <p>Loading...</p>
})

export default function Header({ user }: { user: any }) {
    const [openMenu, setOpenMenu] = useState(false)
    const { cartItems } = useContext(CartContext)
    const { isMenuOpen, isSearchOpen, toggleSearchDrawer, toggleMenuDrawer, closeMenu } = useContext(MenuContext)

    return (
        <div>
            <header className="flex justify-between py-2 px-2 sm:px-6 md:px-8 w-full h-auto bg-white dark:bg-black"
                aria-label="Κεφαλίδα">
                <div className='flex lg:hidden font-extrabold text-2xl items-end'>
                    <ToggleMobileMenu />
                </div>
                <div className="">
                    <Logo />
                </div>
                <div className="lg:hidden flex items-end justify-end">
                    <div className="inline-flex items-center group relative">
                        <Link href="/shopping-cart/" className='m-4' onClick={() => closeMenu()}
                            aria-label="Σύνδεσμος ανακατεύθυνσης στο καλάθι σας">
                            <FaOpencart className="text-2xl" aria-label="Κουμπί ανακατεύθυνσης στο καλάθι σας" />
                        </Link>
                        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full top-1 right-1 dark:border-gray-900">
                            {cartItems.reduce((previousValue, currentValue, currentIndex) => { return previousValue + currentValue.quantity }, 0)}
                        </div>
                    </div>
                </div>
                <div className="hidden place-self-center w-2/3 lg:flex items-center justify-center">
                    <SearchInput />
                </div>
                <HeaderActions user={user} />
            </header>
            <div className="flex content-start">
                <div className='hidden my-4 lg:flex relative w-full'>
                    <div className="flex max-w-fit items-center z-50 mb-2 ml-8 border-siteColors-lightblue text-lg cursor-pointer" onMouseEnter={() => setOpenMenu(true)}
                        onMouseLeave={() => setOpenMenu(false)}>
                        <FaBarsStaggered aria-label="Κουμπί ανοιγματος κυρίως μενού!" className='mr-2' />
                        <span className=' font-bold'>ΠΡΟΙΟΝΤΑ</span>
                        <MainMenu isMenuOpen={openMenu} />
                    </div>
                </div>
            </div>
        </div>
    )
}