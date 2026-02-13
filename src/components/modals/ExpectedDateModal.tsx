'use client'
import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

interface ExpectedDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string | number;
}

export default function ExpectedDateModal({ 
  isOpen, 
  onClose, 
  productName, 
  productId 
}: ExpectedDateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 640);
      
      const handleResize = () => {
        setWindowHeight(window.innerHeight);
        setIsMobile(window.innerWidth < 640);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/expected-date-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productName,
          productId,
          inquiryType: 'expected_date',
          status: 'IsExpected'
        })
      });
      
      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Διαφορετικό ύψος ανάλογα με τη συσκευή
  const modalHeight = isMobile 
    ? `min-h-[${windowHeight - 40}px]` // Σχεδόν όλη η οθόνη στο mobile
    : 'max-h-[85vh]'; // Κανονικό στο desktop

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Mobile: από κάτω προς τα πάνω, Desktop: κεντραρισμένο */}
      <div className={`
        bg-white dark:bg-slate-900 w-full 
        ${isMobile 
          ? 'rounded-t-2xl max-h-[90vh] animate-slide-up' 
          : 'rounded-2xl shadow-2xl max-w-md max-h-[85vh] mx-4'
        }
        flex flex-col
      `}>
        
        {/* Mobile drag indicator - μόνο για mobile */}
        {isMobile && (
          <div className="w-full flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>
        )}

        {/* Fixed Header */}
        <div className={`
          flex-shrink-0 border-b border-slate-200 dark:border-slate-700
          ${isMobile ? 'p-4' : 'p-6 pb-4'}
        `}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className={`
                  rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0
                  ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
                `}>
                  <FaCalendarAlt className={`
                    ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} 
                    text-amber-600 dark:text-amber-400
                  `} />
                </div>
                <h2 className={`
                  font-bold text-slate-800 dark:text-white
                  ${isMobile ? 'text-xl' : 'text-2xl'}
                `}>
                  Αναμενόμενο Προϊόν
                </h2>
              </div>
              <p className={`
                text-slate-600 dark:text-slate-300 break-words
                ${isMobile ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2'}
              `}>
                {productName}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`
                hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0
                ${isMobile ? 'p-1.5 ml-2' : 'p-2 ml-4'}
              `}
              aria-label="Κλείσιμο"
            >
              <FaTimes className={`
                text-slate-500
                ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}
              `} />
            </button>
          </div>
        </div>

        {/* Scrollable Content - με adaptive ύψος */}
        <div className={`
          flex-1 overflow-y-auto
          ${isMobile ? 'p-4' : 'p-6 pt-2'}
        `}>
          {submitSuccess ? (
            <div className="text-center py-6 sm:py-8">
              <div className={`
                rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4
                ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
              `}>
                <FaCalendarAlt className={`
                  text-green-600 dark:text-green-400
                  ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}
                `} />
              </div>
              <h3 className={`
                font-bold text-green-600 dark:text-green-400 mb-2
                ${isMobile ? 'text-lg' : 'text-xl'}
              `}>
                Ερώτημα Υποβλήθηκε!
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Θα επικοινωνήσουμε μαζί σας μόλις έχουμε νεότερη ενημέρωση.
              </p>
            </div>
          ) : (
            <>
              {/* Info Message - πιο compact στο mobile */}
              <div className={`
                bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg
                ${isMobile ? 'p-3 mb-4' : 'p-4 mb-6'}
              `}>
                <p className={`
                  text-amber-800 dark:text-amber-200
                  ${isMobile ? 'text-xs' : 'text-sm'}
                `}>
                  <span className="font-semibold">Το προϊόν αναμένεται σύντομα.</span>
                  {!isMobile && <br />}
                  {' '}Συμπληρώστε τα στοιχεία σας και θα σας ενημερώσουμε μόλις έχουμε ακριβή ημερομηνία άφιξης.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Όνομα */}
                <div>
                  <label className={`
                    block font-medium text-slate-700 dark:text-slate-300 mb-1
                    ${isMobile ? 'text-xs' : 'text-sm'}
                  `}>
                    Ονοματεπώνυμο *
                  </label>
                  <div className="relative">
                    <FaUser className={`
                      absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400
                      ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}
                    `} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`
                        w-full pl-9 sm:pl-10 pr-4 border border-slate-300 dark:border-slate-700 rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-amber-500 focus:border-transparent
                        ${isMobile ? 'py-2 text-sm' : 'py-2.5 text-base'}
                      `}
                      placeholder="Το όνομά σας"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`
                    block font-medium text-slate-700 dark:text-slate-300 mb-1
                    ${isMobile ? 'text-xs' : 'text-sm'}
                  `}>
                    Email *
                  </label>
                  <div className="relative">
                    <FaEnvelope className={`
                      absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400
                      ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}
                    `} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`
                        w-full pl-9 sm:pl-10 pr-4 border border-slate-300 dark:border-slate-700 rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-amber-500 focus:border-transparent
                        ${isMobile ? 'py-2 text-sm' : 'py-2.5 text-base'}
                      `}
                      placeholder="Το email σας"
                    />
                  </div>
                </div>

                {/* Τηλέφωνο */}
                <div>
                  <label className={`
                    block font-medium text-slate-700 dark:text-slate-300 mb-1
                    ${isMobile ? 'text-xs' : 'text-sm'}
                  `}>
                    Τηλέφωνο (Προαιρετικό)
                  </label>
                  <div className="relative">
                    <FaPhone className={`
                      absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400
                      ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}
                    `} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`
                        w-full pl-9 sm:pl-10 pr-4 border border-slate-300 dark:border-slate-700 rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-amber-500 focus:border-transparent
                        ${isMobile ? 'py-2 text-sm' : 'py-2.5 text-base'}
                      `}
                      placeholder="Τηλέφωνο επικοινωνίας"
                    />
                  </div>
                </div>

                {/* Μήνυμα */}
                <div>
                  <label className={`
                    block font-medium text-slate-700 dark:text-slate-300 mb-1
                    ${isMobile ? 'text-xs' : 'text-sm'}
                  `}>
                    Μήνυμα (Προαιρετικό)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={isMobile ? 2 : 3}
                    className={`
                      w-full px-4 border border-slate-300 dark:border-slate-700 rounded-lg 
                      bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                      focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none
                      ${isMobile ? 'py-2 text-sm' : 'py-2.5 text-base'}
                    `}
                    placeholder="Προσθέστε επιπλέον πληροφορίες ή ερωτήσεις..."
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Fixed Footer - πιο compact στο mobile */}
        {!submitSuccess && (
          <div className={`
            flex-shrink-0 border-t border-slate-200 dark:border-slate-700
            ${isMobile ? 'p-4 pt-3' : 'p-6 pt-4'}
          `}>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                w-full bg-gradient-to-r from-amber-500 to-amber-600 
                hover:from-amber-600 hover:to-amber-700 text-white font-semibold 
                rounded-lg transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isMobile ? 'py-2.5 text-sm' : 'py-3 text-base'}
              `}
            >
              {isSubmitting ? 'Υποβολή...' : 'Ενημερώστε με για ημερομηνία'}
            </button>
            <p className={`
              text-slate-500 dark:text-slate-400 mt-2 text-center
              ${isMobile ? 'text-xs' : 'text-sm'}
            `}>
              Θα λάβετε email μόλις έχουμε νεότερη ενημέρωση
            </p>
          </div>
        )}
      </div>
    </div>
  );
}