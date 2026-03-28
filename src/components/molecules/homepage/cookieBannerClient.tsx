"use client";
import { useState, useEffect } from "react";
import { setCookie } from "cookies-next";
import { FaCookieBite, FaTimes } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function CookieBannerClient({ consent }: { consent: boolean }) {
  const [hidden, setHidden] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!consent) {
      setTimeout(() => {
        setHidden(false);
        setTimeout(() => setAnimate(true), 10);
      }, 800);
    }
  }, [consent]);

  const updateConsent = (allowed: boolean) => {
    // Check if gtag exists
    if (typeof window.gtag === 'undefined') {
      return;
    }

    // Google Consent Mode v2 update
    window.gtag("consent", "update", {
      ad_storage: allowed ? "granted" : "denied",
      analytics_storage: allowed ? "granted" : "denied",
      ad_personalization: allowed ? "granted" : "denied",
      ad_user_data: allowed ? "granted" : "denied",
    });

  };

  const handleConsent = (allowed: boolean) => {
    // 1. Set cookie
    setCookie("cookie_consent", String(allowed), {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    // 2. Update consent mode
    updateConsent(allowed);

    // 3. Hide banner
    setAnimate(false);
    setTimeout(() => setHidden(true), 350);

    // 4. Reload page to re-track with new consent (optional but recommended)
    if (allowed) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (hidden) return null;

  return (
    <div
      className={`
        fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50
        bg-white p-5 rounded-xl shadow-lg border border-gray-200
        transition-all duration-300 transform
        ${animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
      `}
    >
      <div className="flex items-start mb-3">
        <div className="bg-blue-600 p-2 rounded-lg mr-3 flex items-center justify-center">
          <FaCookieBite className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-blue-800">
            Ρυθμίσεις Cookies
          </h2>
          <div className="flex items-center text-xs mt-1 text-blue-600">
            <IoMdInformationCircleOutline className="mr-1" />
            Επιλέξτε προτιμήσεις cookies.
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας. 
        Διαβάστε την{" "}
        <a
          href="/pages/politiki-aporritoy"
          className="text-blue-700 hover:underline font-medium"
        >
          Πολιτική Απορρήτου
        </a>.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleConsent(false)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Απόρριψη
        </button>
        <button
          onClick={() => handleConsent(true)}
          className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-pink-600 text-white"
        >
          Αποδοχή όλων
        </button>
      </div>
    </div>
  );
}