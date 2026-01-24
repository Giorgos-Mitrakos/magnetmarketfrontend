// app/newsletter/unsubscribe/unsubscribe-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trackNewsletterUnsubscribe } from '@/lib/helpers/advanced-analytics';

export default function UnsubscribeClient() {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!email || !token) {
            // Ανακατεύθυνση στη σελίδα σφάλματος αν λείπουν παράμετροι
            router.push('/newsletter/unsubscribe/error?message=Λείπουν απαραίτητες πληροφορίες. Παρακαλώ χρησιμοποιήστε τον σύνδεσμο από το email.');
        }
    }, [email, token, router]);

    const handleUnsubscribe = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token }),
            });

            if (response.ok) {
                // ✅ Track successful unsubscribe
                trackNewsletterUnsubscribe(email || undefined);
                router.push('/newsletter/unsubscribe/success');
            } else {
                const errorData = await response.json();
                // Ανακατεύθυνση στη σελίδα σφάλματος με το μήνυμα
                router.push(`/newsletter/unsubscribe/error?message=${encodeURIComponent(errorData.error.message || 'Η διαγραφή απέτυχε')}`);
            }
        } catch (error) {
            // Ανακατεύθυνση στη σελίδα σφάλματος
            router.push('/newsletter/unsubscribe/error?message=Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            setIsLoading(false);
        }
    };

    // Αν λείπουν παράμετροι, δεν εμφανίζουμε τίποτα (θα γίνει redirect)
    if (!email || !token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-slate-700 p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-siteColors-purple dark:text-purple-400 mb-4">
                    Επιβεβαίωση Διαγραφής
                </h1>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                    Θέλετε να διαγραφείτε από τη λίστα παραληπτών του MagnetMarket newsletter;
                </p>
                
                <div className="bg-gray-100 dark:bg-slate-600 p-4 rounded-md mb-6">
                    <p className="text-sm text-gray-700 dark:text-slate-200">
                        Email: <strong>{email}</strong>
                    </p>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={handleUnsubscribe}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-busy={isLoading}
                    >
                        {isLoading ? 'Περιμένετε...' : 'Ναι, Διαγραφή'}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="flex-1 bg-gray-300 dark:bg-slate-500 text-gray-700 dark:text-slate-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        Ακύρωση
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Μετά τη διαγραφή δεν θα λαμβάνετε άλλα emails από εμάς
                    </p>
                </div>
            </div>
        </div>
    );
}