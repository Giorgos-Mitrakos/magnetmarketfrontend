'use client'
import { useState } from 'react'
// import { useCart } from '@/context/cart';
import { useCheckout } from '@/context/checkout';
import { toast } from 'sonner';

export default function CouponForm() {
    const { checkout,
        dispatch,
        validationError,
        validateCoupon,
        applyCoupon } = useCheckout()
    const [code, setCode] = useState<string>('')
    const [isValidating, setIsValidating] = useState<boolean>(false)
    const [isApplying, setIsApplying] = useState<boolean>(false)

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        if (!code.trim()) return

        try {
            setIsValidating(true)

            // If same coupon is already applied, skip validation
            if (checkout.appliedCoupon?.code === code) {
                setIsApplying(true)
                await applyCoupon(code, checkout.cart)
                return
            }

            // Validate new coupon first
            const validation = await validateCoupon(code, checkout.cart)
            if (!validation.valid) {
                toast.error(validation.message, {
                    position: 'top-right',
                })
                setCode('')
                return
            }

            // If validation successful, apply it
            setIsApplying(true)
            const applianceCoupon = await applyCoupon(code, checkout.cart)
            if (!applianceCoupon.success) {
                toast.error(applianceCoupon.message, {
                    position: 'top-right',
                })
            }
            else {
                toast.success(applianceCoupon.message, {
                    position: 'top-right',
                })
            }
        } catch (error) {
            console.error('Coupon error:', error)
        } finally {
            setIsValidating(false)
            setIsApplying(false)
        }
    }

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            dispatch({ type: "REMOVE_COUPON" })
            setCode('') // Clear the input field
        } catch (error) {
            console.error('Failed to remove coupon:', error)
        }
    }

    return (
        <div className="space-y-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Κωδικός"
                    className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!checkout.appliedCoupon || isValidating}
                />

                {!checkout.appliedCoupon ? (
                    <button
                        type="submit"
                        disabled={isValidating || isApplying}
                        className={`px-4 py-2 rounded text-white ${(isValidating || isApplying)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isValidating ? 'Validating...' :
                            isApplying ? 'Applying...' : 'Εφαρμογή'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        disabled={isApplying}
                    >
                        Remove
                    </button>
                )}
            </form>

            {
                validationError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                        {validationError}
                    </div>
                )
            }

            {
                checkout.appliedCoupon && !validationError && (
                    <div className="p-3 bg-green-50 text-green-700 rounded">
                        <p className="font-semibold">✓ Το κουπόνι έχει εφαρμοστεί</p>
                        <p>
                            {
                                checkout.appliedCoupon.discountType === 'free_shipping' ? (
                                    "Δωρεάν μεταφορικά"
                                ) : (
                                    `${checkout.appliedCoupon.discountValue}${checkout.appliedCoupon.discountType === 'percentage' ? '% έκπτωση' : '€ έκπτωση'
                                    }`
                                )
                            }
                        </p>
                    </div>
                )
            }
        </div >
    )
}