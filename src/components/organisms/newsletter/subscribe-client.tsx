// components/organisms/newsletter/subscribe-client.tsx
// (2026-10-26) Το αποτέλεσμα φαίνεται στην ίδια σελίδα (όχι πια μεταφορά σε
// /success?message=… — κανείς δεν μπορεί να «γράψει» δικό του κείμενο στο site μας μέσω URL).
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackNewsletterSignup } from '@/lib/helpers/advanced-analytics';

const PRIVACY_URL = '/pages/politiki-aporritoy';

export default function SubscribeClient() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const clean = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
            setError('Το email δεν είναι σωστό.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: clean, source: 'page' }),
            });
            const data = await response.json().catch(() => ({}));
            // Double opt-in: η εγγραφή ολοκληρώνεται από τον σύνδεσμο του email
            if (response.ok) {
                trackNewsletterSignup('page');
                setSentTo(clean);
            } else {
                setError(data.message || 'Δεν ήταν δυνατή η εγγραφή αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο.');
            }
        } catch {
            setError('Σφάλμα σύνδεσης. Δοκιμάστε ξανά.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-700 rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    {sentTo ? (
                        <div className="text-center" role="status">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Σχεδόν έτοιμο!</h1>
                            <p className="mt-3 text-slate-600 dark:text-slate-300">
                                Στείλαμε email στο <strong className="break-all">{sentTo}</strong>. Πατήστε τον σύνδεσμο που περιέχει για να ολοκληρωθεί η εγγραφή.
                            </p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Δεν το βλέπετε; Ελέγξτε και τον φάκελο «Ανεπιθύμητα» ή «Προωθήσεις».</p>
                            <Link href="/" className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors">
                                Συνέχεια αγορών
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-siteColors-purple dark:text-purple-300">Εγγραφή στο newsletter</h1>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                    Προσφορές, κουπόνια και νέα προϊόντα — πρώτοι εσείς.
                                </p>
                            </div>

                            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate aria-label="Φόρμα εγγραφής newsletter">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        aria-invalid={!!error}
                                        aria-describedby={error ? 'email-error' : undefined}
                                        className="mt-1 block w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-siteColors-purple focus:border-siteColors-purple dark:bg-slate-600 dark:text-slate-100"
                                        placeholder="το email σας"
                                    />
                                    {error && <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    aria-busy={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-siteColors-purple hover:bg-siteColors-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-siteColors-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Εγγραφή…' : 'Εγγραφή'}
                                </button>
                            </form>

                            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                Θα λαμβάνετε emails με προσφορές και νέα. Μπορείτε να διαγραφείτε όποτε θέλετε από τον σύνδεσμο σε κάθε email.{' '}
                                <Link href={PRIVACY_URL} className="underline">Πολιτική απορρήτου</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
