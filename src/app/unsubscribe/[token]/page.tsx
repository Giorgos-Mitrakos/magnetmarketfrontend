'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UnsubscribePage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const processUnsubscribe = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notify-me/unsubscribe/${params.token}`);
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);

                    // Ανακατεύθυνση μετά από 5 δευτερόλεπτα
                    setTimeout(() => {
                        router.push('/');
                    }, 5000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Σφάλμα κατά τη διαγραφή');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Σφάλμα σύνδεσης με τον server');
            }
        };

        if (params.token) {
            processUnsubscribe();
        }
    }, [params.token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                {status === 'loading' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-siteColors-purple mx-auto"></div>
                        <p className="mt-4 text-gray-600">Γίνεται διαγραφή...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Επιτυχής Διαγραφή!</h2>
                        <p className="mt-2 text-gray-600">{message}</p>
                        <p className="mt-4 text-sm text-gray-500">
                            Θα ανακατευθυνθείτε στην αρχική σελίδα σε 5 δευτερόλεπτα...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Σφάλμα</h2>
                        <p className="mt-2 text-gray-600">{message}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-4 py-2 bg-siteColors-purple text-white rounded-lg hover:bg-siteColors-purple-dark transition-colors"
                        >
                            Πίσω στην Αρχική
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}