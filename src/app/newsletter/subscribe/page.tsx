'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SubscribePage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email
                }),
            });

            const data = await response.json()

            switch (data.message) {
                case "suceess subscribe":
                    router.push('/newsletter/subscribe/success');
                    break;

                case "suceess activate":
                    router.push('/newsletter/subscribe/success?message=Η εγγραφή στο newsletter ενεργοποιήθηκε ξανά!');
                    break;

                case "This attribute must be unique":
                    router.push('/newsletter/subscribe/error?message=Έχετε κάνει ήδη εγγραφή στο newsletter μας!');
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            router.push('newsletter/subscribe/error?message=Subscription failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-siteColors-purple">Εγγραφή στο Newsletter</h2>
                        <p className="mt-2 text-slate-600">
                            Για να μην χάνεις καμία προσφορά!!!
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Εγγραφή...' : 'Εγγραφή'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}