'use client'
// components/atoms/WishlistButton.tsx
// Καρδιά «Στα αγαπημένα» για κάρτα προϊόντος και σελίδα προϊόντος.
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useWishlist } from '@/context/wishlist'
import { trackAddToWishlist } from '@/lib/helpers/advanced-analytics'
import { fbTrackAddToWishlist } from '@/lib/helpers/facebook-pixel'

interface WishlistButtonProps {
    documentId?: string | null
    /** Στοιχεία για το Analytics (προαιρετικά) */
    product?: { id: number; name: string; price?: number | null; sale_price?: number | null; is_sale?: boolean; brand?: any; category?: any }
    variant?: 'card' | 'page' | 'compact'
    className?: string
}

const STYLES = {
    card: 'flex justify-center items-center p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-siteColors-pink/20 transition-all duration-200',
    compact: 'flex justify-center items-center w-12 h-12 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-siteColors-pink/10 transition-colors',
    page: 'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-siteColors-pink/40 text-siteColors-purple dark:text-slate-100 font-semibold hover:bg-siteColors-pink/10 transition-colors',
}

export default function WishlistButton({ documentId, product, variant = 'card', className = '' }: WishlistButtonProps) {
    const { has, toggle, ready, isAuthenticated } = useWishlist()
    const router = useRouter()
    if (!documentId) return null
    const active = has(documentId)

    const onClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const added = await toggle(documentId)
        if (added && !active) {
            toast.success('Προστέθηκε στα αγαπημένα', {
                description: isAuthenticated ? undefined : 'Συνδεθείτε για να τα βλέπετε από κάθε συσκευή.',
                action: { label: 'Προβολή', onClick: () => router.push('/wishlist') },
            })
            if (product && typeof product.price === 'number') {
                try {
                    trackAddToWishlist(product)
                    fbTrackAddToWishlist({ ...product, brand: product.brand?.name ?? product.brand ?? null } as any)
                } catch {
                    // το tracking δεν πρέπει ποτέ να χαλάει την ενέργεια
                }
            }
        }
    }

    const label = active ? 'Αφαίρεση από τα αγαπημένα' : 'Προσθήκη στα αγαπημένα'
    const Icon = active ? FaHeart : FaRegHeart
    const iconColor = active ? 'text-siteColors-pink' : 'text-slate-400 dark:text-slate-400'

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            aria-label={label}
            title={label}
            disabled={!ready}
            className={`${STYLES[variant]} ${className}`}
        >
            <Icon aria-hidden="true" className={`${iconColor} text-xl`} />
            {/* (2026-10-28) Ίδιο κείμενο σε όλες τις καταστάσεις· η κατάσταση φαίνεται από την καρδιά (και το aria-label) */}
            {variant === 'page' && <span>Αγαπημένα</span>}
        </button>
    )
}
