'use client'
import HeaderActions from "../molecules/headerActions";
import Logo from "../atoms/logo";
import { useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";
import MainMenu from "./mainMenu";
// import SearchInput from "../molecules/searchInput";
import dynamic from "next/dynamic";
import Minicart from "./minicart";

const SearchInput = dynamic(() => import('@/components/molecules/searchInput'), {
    ssr: false,
    loading: () => <p>Loading...</p>
})

export default function Header({ user }: { user: any }) {
    const [openMenu, setOpenMenu] = useState(false)

    return (
        <div>
            <header className="grid lg:grid-cols-3 p-2 w-full h-auto dark:bg-black"
                aria-label="Κεφαλίδα">
                <Logo />
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