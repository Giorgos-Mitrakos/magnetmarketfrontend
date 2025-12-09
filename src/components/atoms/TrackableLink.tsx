// components/atoms/TrackableLink.tsx
// Client component που κάνει μόνο tracking - χρησιμοποιείται από server components

'use client'

import Link from 'next/link'
import { useCallback, ReactNode } from 'react'
import { trackBannerClick } from '@/lib/helpers/advanced-analytics'
import { fbTrackCustomEvent } from '@/lib/helpers/facebook-pixel'

interface TrackableLinkProps {
    href: string
    target?: string
    className?: string
    children: ReactNode
    // Tracking props
    bannerId: string
    bannerName: string
    bannerPosition: string
    bannerType?: 'hero' | 'single' | 'double' | 'triple' | 'side'
}

/**
 * TrackableLink - Wrapper component για banner tracking
 * Χρήση: Αντικαθιστά το απλό <Link> σε server components
 */
export const TrackableLink = ({
    href,
    target,
    className,
    children,
    bannerId,
    bannerName,
    bannerPosition,
    bannerType = 'hero'
}: TrackableLinkProps) => {
    
    const handleClick = useCallback(() => {
        // GA4 Tracking
        trackBannerClick(bannerId, bannerName, bannerPosition, href)

        // Facebook Pixel
        fbTrackCustomEvent('BannerClick', {
            banner_id: bannerId,
            banner_name: bannerName,
            banner_type: bannerType,
            destination_url: href
        })
    }, [bannerId, bannerName, bannerPosition, bannerType, href])

    return (
        <Link 
            href={href}
            target={target}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Link>
    )
}

