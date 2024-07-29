import { FaHome, FaOpencart, FaSearch, } from 'react-icons/fa'
import Link from "next/link";
import { AiOutlineHome, AiOutlineMenu, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai';

export default function MobileTabMenu() {
    return (
        <div className='flex lg:hidden px-2 xs:px-4 text-2xl justify-between z-20 sticky bottom-0 w-full left-0 bg-siteColors-lightblue text-white shadow-topShadow'>
            <Link href="/" className='py-4 xs:px-4'>
                <AiOutlineHome />
            </Link>
            <button className='py-4 xs:px-4'>
                <AiOutlineSearch />
            </button>
            <button className='py-4 xs:px-4'>
                <AiOutlineMenu />
            </button>
            <Link href="/" className='py-4 xs:px-4'>
                <AiOutlineUser />
            </Link>
            <Link href="/" className='py-4 xs:px-4'>
                <FaOpencart />
            </Link>
        </div>
    )
}