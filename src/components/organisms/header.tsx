'use client'
import HeaderActions from "../molecules/headerActions";
import Logo from "../atoms/logo";
import { useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";
import MainMenu from "./mainMenu";
import SearchInput from "../molecules/searchInput";

export default function Header({ user }: { user: any }) {
    const [openMenu, setOpenMenu] = useState(false)

    return (
        <div>
            <header className="flex justify-center xs:flex-row p-2 w-full h-auto lg:justify-between dark:bg-black"
                aria-label="Κεφαλίδα">
                <Logo />
                <div className="hidden lg:flex items-center">
                    <SearchInput />
                </div>
                <HeaderActions user={user} />
            </header>
            <div className="flex content-start">
                <div className='hidden my-4 lg:flex relative w-full'>
                    <div className="flex max-w-fit items-center z-50 mb-2 ml-8 border-siteColors-lightblue text-lg cursor-pointer" onMouseEnter={() => setOpenMenu(true)}
                        onMouseLeave={() => setOpenMenu(false)}>
                        <FaBarsStaggered className='mr-2' />
                        <span className=' font-bold'>ΠΡΟΙΟΝΤΑ</span>
                        <MainMenu isMenuOpen={openMenu} />
                    </div>
                </div>
            </div>
        </div>
    )
}