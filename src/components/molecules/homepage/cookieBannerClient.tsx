// components/CookieBannerClient.tsx
"use client";

import { useState } from "react";
import { setCookie } from "cookies-next";

export default function CookieBannerClient() {
  const [hidden, setHidden] = useState(false);

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

    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="bg-blue-100 p-4 rounded-lg fixed bottom-4 left-4 right-4 shadow z-50">
      <h2 className="text-lg font-semibold">Ρυθμίσεις και Πολιτική Cookies</h2>
      <p className="my-2 text-sm">
        Χρησιμοποιούμε cookies για να κάνουμε ακόμα καλύτερη την εμπειρία σας στο site μας και για να διασφαλιστεί η αποτελεσματική λειτουργία της ιστοσελίδα μας.
      </p>
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => handleConsent(false)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Απόρριψη
        </button>
        <button
          onClick={() => handleConsent(true)}
          className="bg-green-700 text-white px-4 py-2 rounded"
        >
          Αποδοχή
        </button>
      </div>
    </div>
  );
}
