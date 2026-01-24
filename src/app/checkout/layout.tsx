import { Metadata } from 'next'

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
}

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="checkout-wrapper">
            {/* Add checkout-specific styles or components */}
            {children}
        </div>
    )
}