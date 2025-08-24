// components/CookieBannerClient.tsx
"use client";

import { useState, useEffect } from "react";
import { setCookie, getCookie } from "cookies-next";
import { FaCookieBite, FaTimes } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function CookieBannerClient(consent: { consent: boolean }) {
  const [hidden, setHidden] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Check if consent already given
    if (!consent.consent) {
      // Show banner with slight delay for better UX
      setTimeout(() => {
        setHidden(false);
        setTimeout(() => setAnimate(true), 10);
      }, 1000);
    }
  }, []);

  const handleConsent = (consent: boolean) => {
    setCookie("cookie_consent", String(consent), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    if (window?.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: consent ? "granted" : "denied",
      });
    }

    // Animate out before hiding
    setAnimate(false);
    setTimeout(() => setHidden(true), 300);
  };

  if (hidden) return null;

  return (
    <div className={`
      fixed bottom-4 left-4 right-4 max-w-md mx-auto sm:left-6 sm:right-auto z-50
      bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl shadow-lg border border-blue-100
      transition-all duration-300 transform
      ${animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
    `}>
      {/* Close button */}
      <button
        onClick={() => handleConsent(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-[#a9488e] transition-colors"
        aria-label="Close"
      >
        <FaTimes size={16} />
      </button>

      {/* Header */}
      <div className="flex items-start mb-3">
        <div className="bg-gradient-to-br from-[#246eb5] to-[#24488f] p-2 rounded-lg mr-3 flex items-center justify-center">
          <FaCookieBite className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#24488f]">Ρυθμίσεις και Πολιτική Cookies</h2>
          <div className="flex items-center text-xs mt-1 text-[#6e276f]">
            <IoMdInformationCircleOutline className="mr-1" />
            Απαραίτητο για τη λειτουργία της ιστοσελίδας
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-600 mb-4">
        Χρησιμοποιούμε cookies για να κάνουμε ακόμα καλύτερη την εμπειρία σας στο site μας και για να διασφαλιστεί η αποτελεσματική λειτουργία της ιστοσελίδα μας. Μπορείτε να διαβάσετε περισσότερα στην <a href="/pages/politiki-aporritoy" className="text-[#6e276f] hover:underline font-medium">Πολιτική Απορρήτου</a>.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleConsent(false)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
        >
          Απόρριψη
        </button>
        <button
          onClick={() => handleConsent(true)}
          className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#24488f] to-[#6e276f] text-white hover:from-[#1d3a76] hover:to-[#5a1f5b] transition-all duration-300 font-medium shadow-md flex items-center justify-center"
        >
          Αποδοχή όλων
        </button>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        Κάνοντας κλικ στην "Αποδοχή όλων", συμφωνείτε με την χρήση όλων των cookies.
      </p>
    </div>
  );
}