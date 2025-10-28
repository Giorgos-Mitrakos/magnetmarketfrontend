// Header.tsx
'use client'
import HeaderActions from "../molecules/headerActions";
import Logo from "../atoms/logo";
import { useContext, useState } from "react";
import { FaAngleDown, FaBarsStaggered } from "react-icons/fa6";
import MainMenu from "./mainMenu";
import dynamic from "next/dynamic";
import Minicart from "./minicart";
import { ToggleMobileMenu } from "../atoms/toggleMobileMenu";
import Link from "next/link";
import { FaOpencart } from "react-icons/fa";
import { MenuContext } from "@/context/menu";
import { useCheckout } from "@/context/checkout";
import { IImageAttr } from "@/lib/interfaces/image";

const SearchInput = dynamic(() => import('@/components/molecules/searchInput'), {
    ssr: false,
    loading: () => <p>Loading...</p>
})

// Τύπος για τα δεδομένα μενού
interface MenuData {
    id: number
    slug: string;
    name: string;
    description:string
    image: IImageAttr
    categories: any[];
}

interface HeaderProps {
    user: any;
    menuData: MenuData[]; // Προσθήκη των προ-φορτωμένων δεδομένων
}

export default function Header({ user, menuData }: HeaderProps) {
    const [openMenu, setOpenMenu] = useState(false)
    const { checkout, dispatch } = useCheckout()
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
                            {checkout.cart.reduce((previousValue, currentValue, currentIndex) => { return previousValue + currentValue.quantity }, 0)}
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
                    <div
                        className="relative"
                        onMouseEnter={() => setOpenMenu(true)}
                        onMouseLeave={() => setOpenMenu(false)}
                    >
                        <div className="flex items-center z-50 ml-8 px-4 py-3 rounded-lg text-lg cursor-pointer transition-all duration-300 group bg-white dark:bg-slate-800 hover:bg-siteColors-lightblue/10 dark:hover:bg-siteColors-lightblue/20">
                            <FaBarsStaggered
                                aria-label="Κουμπί ανοιγματος κυρίως μενού!"
                                className='mr-3 text-siteColors-blue dark:text-white transition-colors duration-300 group-hover:text-siteColors-lightblue dark:group-hover:text-siteColors-lightblue'
                            />
                            <span className='font-bold text-siteColors-blue dark:text-white transition-colors duration-300 group-hover:text-siteColors-lightblue dark:group-hover:text-siteColors-lightblue'>
                                ΚΑΤΗΓΟΡΙΕΣ
                            </span>

                            <div className={`ml-2 transform transition-transform duration-300 ${openMenu ? 'rotate-180' : 'rotate-0'}`}>
                                <FaAngleDown className="text-siteColors-blue dark:text-white group-hover:text-siteColors-lightblue dark:group-hover:text-siteColors-lightblue transition-colors" />
                            </div>
                        </div>

                        <div className="absolute top-full left-0 z-50">
                            <MainMenu isMenuOpen={openMenu} menuData={menuData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}