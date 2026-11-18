'use client'
// components/atoms/WishlistHeaderLink.tsx — καρδιά με μετρητή (κεφαλίδα / μενού κινητού)
import Link from 'next/link'
import { FaRegHeart } from 'react-icons/fa'
import { useWishlist } from '@/context/wishlist'

export default function WishlistHeaderLink({ className = '', badgeClassName = '', onClick }: { className?: string; badgeClassName?: string; onClick?: () => void }) {
    const { ids, ready } = useWishlist()
    const count = ready ? ids.length : 0
    return (
        <Link
            href="/wishlist"
            onClick={onClick}
            className={`relative inline-flex items-center ${className}`}
            aria-label={count ? `Τα αγαπημένα σας (${count})` : 'Τα αγαπημένα σας'}
        >
            <FaRegHeart aria-hidden="true" />
            {count > 0 && (
                <span className={`absolute inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold text-white bg-siteColors-pink border-2 border-white rounded-full dark:border-gray-900 ${badgeClassName}`}>
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    )
}
