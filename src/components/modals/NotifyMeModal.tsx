'use client'
import { useState } from 'react';
import { FaTimes, FaEnvelope, FaBell } from 'react-icons/fa';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: number;
}

export default function NotifyMeModal({ isOpen, onClose, productName, productId }: NotifyMeModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Εδώ θα κάνεις το API call
      const response = await fetch('/api/notify-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productName,
          productId
        })
      });
      
      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setEmail('');
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
                Ειδοποίηση Ξανά
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
                <FaBell className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                Εγγραφή Επιτυχής!
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Θα σας ειδοποιήσουμε όταν το προϊόν είναι ξανά διαθέσιμο.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full mx-auto">
                <FaBell className="w-10 h-10 text-white" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  Μείνετε Ενημερωμένοι
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Αφήστε το email σας και θα σας ειδοποιήσουμε μόλις το προϊόν επανέλθει σε διαθεσιμότητα.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Εγγραφή...' : 'Εγγραφή για Ειδοποίηση'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}