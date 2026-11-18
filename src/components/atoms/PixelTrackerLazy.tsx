'use client'
// (2026-10-28) Next.js 16: το dynamic(…, { ssr: false }) επιτρέπεται μόνο σε Client Component.
// Το react-facebook-pixel αγγίζει το window μόλις φορτωθεί — γι' αυτό φορτώνεται μόνο στον browser.
import dynamic from 'next/dynamic'

const PixelTracker = dynamic(() => import('./pixelTracker'), { ssr: false })

export default PixelTracker
