'use client'
import { useState } from 'react'
import { useCheckout } from '@/context/checkout';
import { toast } from 'sonner';

export default function CouponForm() {
    const { checkout, dispatch, validationError, validateCoupon, applyCoupon } = useCheckout()
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
            } else {
                toast.success(applianceCoupon.message, {
                    position: 'top-right',
                })
            }
        } catch (error) {
            console.error('Coupon error:', error)
            toast.error('Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.', {
                position: 'top-right',
            })
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
            setCode('')
            toast.success('Το κουπόνι αφαιρέθηκε', {
                position: 'top-right',
            })
        } catch (error) {
            console.error('Failed to remove coupon:', error)
            toast.error('Αποτυχία αφαίρεσης κουπονιού', {
                position: 'top-right',
            })
        }
    }

    const isLoading = isValidating || isApplying
    const hasAppliedCoupon = !!checkout.appliedCoupon

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Έχετε κουπόνι;
            </h3>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Εισάγετε κωδικό κουπονιού"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-siteColors-purple focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 transition-colors duration-200"
                        disabled={hasAppliedCoupon || isLoading}
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-siteColors-purple border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {!hasAppliedCoupon ? (
                    <button
                        type="submit"
                        disabled={isLoading || !code.trim()}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[120px] ${isLoading || !code.trim()
                                ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-siteColors-purple to-siteColors-pink hover:from-siteColors-pink hover:to-siteColors-purple text-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isValidating ? (
                            <span className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Ελέγχουμε...
                            </span>
                        ) : isApplying ? (
                            <span className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Εφαρμογή...
                            </span>
                        ) : (
                            'Εφαρμογή'
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 min-w-[120px]"
                        disabled={isLoading}
                    >
                        Αφαίρεση
                    </button>
                )}
            </form>

            {validationError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {validationError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {checkout.appliedCoupon && checkout.appliedCoupon.code && !validationError && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                ✓ Το κουπόνι &ldquo;{checkout.appliedCoupon.code}&rdquo; έχει εφαρμοστεί
                            </p>
                            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                {checkout.appliedCoupon.discountType === 'free_shipping' ? (
                                    "Δωρεάν μεταφορικά"
                                ) : (
                                    `Έκπτωση ${checkout.appliedCoupon.discountValue}${checkout.appliedCoupon.discountType === 'percentage' ? '%' : '€'}`
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}