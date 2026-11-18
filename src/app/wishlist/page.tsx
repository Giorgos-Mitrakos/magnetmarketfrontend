// app/wishlist/page.tsx — «Τα αγαπημένα μου» (για επισκέπτες και πελάτες με λογαριασμό)
import { Metadata } from 'next'
import WishlistClient from '@/components/organisms/wishlist/WishlistClient'

export const metadata: Metadata = {
    title: 'Τα αγαπημένα μου | Magnet Market',
    robots: { index: false, follow: false },
}

export default function WishlistPage() {
    return (
        <div className="container mx-auto px-2 sm:px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-siteColors-purple dark:text-slate-100 mb-6">Τα αγαπημένα μου</h1>
            <WishlistClient />
        </div>
    )
}
