"use client"
import { FaHome, FaOpencart, FaSearch, } from 'react-icons/fa'
import Link from "next/link";
import { AiOutlineHome, AiOutlineMenu, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai';
import { useSession } from 'next-auth/react';
import { useContext, useState } from 'react';
import { CartContext } from '@/context/cart';
import MobileDrawer from './mobileDrawer';
import { MenuContext } from '@/context/menu';
import SearchInput from '../molecules/searchInput';

export default function MobileTabMenu() {
    const { data: session, status } = useSession()

    const { cartItems } = useContext(CartContext)
    const { isMenuOpen, isSearchOpen,toggleSearchDrawer, toggleMenuDrawer, closeMenu } = useContext(MenuContext)

    return (
        <div className='h-full'>
            <div className={`fixed lg:hidden bottom-0 left-0 z-20 h-full w-full shadow-lg bg-blue-100 dark:bg-slate-600
            transition-transform transform ${isMenuOpen ? "translate-x-0" :
                    "-translate-x-full"} duration-500`}>
                <MobileDrawer />
            </div>
            <div className={`fixed lg:hidden rounded w-full z-50 top-0 bg-white shadow-lg flex justify-center p-4 
                transition-transform transform ${isSearchOpen ? "translate-y-0" :
                    "-translate-y-full"} duration-500`}>
                <SearchInput />
            </div>
            <div className='flex lg:hidden px-2 xs:px-4 text-2xl justify-between z-30 fixed bottom-0 w-full left-0 bg-siteColors-lightblue text-white shadow-topShadow'>
                <Link href="/" className='py-4 xs:px-4' onClick={() => closeMenu()}>
                    <AiOutlineHome />
                </Link>
                <button className='py-4 xs:px-4' onClick={toggleSearchDrawer}>
                    <AiOutlineSearch />
                </button>
                <button className='py-4 xs:px-4' onClick={toggleMenuDrawer}>
                    <AiOutlineMenu />
                </button>

                <Link href="/" className='py-4 xs:px-4' onClick={() => closeMenu()}>
                    <AiOutlineUser />
                </Link>
                <div className="inline-flex items-center group relative">
                    <Link href="/shopping-cart/" className='py-4 xs:px-4' onClick={() => closeMenu()}>
                        <FaOpencart />
                    </Link>
                    <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full top-1 right-1 dark:border-gray-900">
                        {cartItems.reduce((previousValue, currentValue, currentIndex) => { return previousValue + currentValue.quantity }, 0)}
                    </div>
                </div>
            </div>
        </div>
    )
}