'use client'

import { useState } from 'react'
import { FiMail, FiCheck, FiGift } from 'react-icons/fi'
import { trackNewsletterSignup } from '@/lib/helpers/advanced-analytics'

interface PostPurchaseNewsletterProps {
    userEmail?: string // Pre-fill if user is logged in
}

export default function PostPurchaseNewsletter({ userEmail }: PostPurchaseNewsletterProps) {
    const [email, setEmail] = useState(userEmail || '')
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.message === 'suceess subscribe' || data.message === 'suceess activate') {
                // ✅ Track successful signup from post-purchase
                trackNewsletterSignup('post-purchase')
                setIsSubscribed(true)
            } else if (data.message === 'This attribute must be unique') {
                setError('Είστε ήδη εγγεγραμμένος στο newsletter!')
            }
        } catch (err) {
            setError('Κάτι πήγε στραβά. Δοκιμάστε ξανά.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubscribed) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
                <div className="flex justify-center mb-3">
                    <div className="bg-green-100 p-3 rounded-full">
                        <FiCheck className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                    Ευχαριστούμε! 🎉
                </h3>
                <p className="text-green-700">
                    Εγγραφήκατε επιτυχώς στο newsletter μας. Θα λαμβάνετε αποκλειστικές προσφορές!
                </p>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border border-purple-200 shadow-md">
            <div className="flex items-start mb-4">
                <div className="bg-gradient-to-r from-siteColors-purple to-siteColors-pink p-3 rounded-xl mr-4 shadow-md flex-shrink-0">
                    <FiGift className="h-7 w-7 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                        Θέλετε αποκλειστικές προσφορές;
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Εγγραφείτε στο newsletter μας και κερδίστε <span className="font-bold text-siteColors-pink">5% έκπτωση</span> στην επόμενη παραγγελία σας!
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Διεύθυνση email"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-siteColors-purple focus:border-siteColors-purple transition-colors"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 flex items-center">
                        <FiCheck className="mr-1" /> {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white font-semibold py-3 px-6 rounded-lg hover:from-siteColors-purple/90 hover:to-siteColors-pink/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Εγγραφή...
                        </span>
                    ) : (
                        'Εγγραφή & Κέρδισε 5% Έκπτωση'
                    )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                    Με την εγγραφή αποδέχεστε τους Όρους Χρήσης
                </p>
            </form>
        </div>
    )
}