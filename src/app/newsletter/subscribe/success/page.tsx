
'use client';

import { useSearchParams } from 'next/navigation';

export default function SubscribeSuccessPage() {
    const searchParams = useSearchParams();

    const message = searchParams.get('message') || 'Σας ευχαριστούμε για την εγγραφή σας στο newsletter του MagnetMarket.';

    return (
        <div className="bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Επιτυχής Εγγραφή!</h2>
                <p className="text-gray-600 mb-6">
                    {message}
                </p>
                <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Επιστροφή στην Αρχική
                </a>
            </div>
        </div>
    );
}