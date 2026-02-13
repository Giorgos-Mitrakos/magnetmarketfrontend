'use client'
import { useState } from 'react';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaComment } from 'react-icons/fa';

interface AskForPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: number;
}

export default function AskForPriceModal({ isOpen, onClose, productName, productId }: AskForPriceModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Εδώ θα κάνεις το API call
            const response = await fetch('/api/ask-for-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    productName,
                    productId
                })
            });

            if (response.ok) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSubmitSuccess(false);
                    setFormData({ name: '', phone: '', email: '', message: '' });
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Αίτηση Προσφοράς
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                Για: {productName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            aria-label="Κλείσιμο"
                        >
                            <FaTimes className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {submitSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaEnvelope className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                                Αποστολή Επιτυχής!
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                Θα επικοινωνήσουμε μαζί σας σύντομα με την προσφορά.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Όνομα *
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-transparent"
                                            placeholder="Το όνομά σας"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Τηλέφωνο *
                                    </label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-transparent"
                                            placeholder="Τηλέφωνο επικοινωνίας"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-transparent"
                                            placeholder="Το email σας"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Μήνυμα (Προαιρετικό)
                                    </label>
                                    <div className="relative">
                                        <FaComment className="absolute left-3 top-3 text-slate-400" />
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-transparent"
                                            placeholder="Προσθέστε επιπλέον πληροφορίες..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Αποστολή...' : 'Αποστολή Αίτησης'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}