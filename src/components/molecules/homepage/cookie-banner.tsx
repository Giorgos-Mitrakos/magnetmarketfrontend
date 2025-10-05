"use client";

import { useState, useEffect } from "react";
import { getLocalStorage, setLocalStorage } from "@/lib/helpers/storage-helper";

// CookieBanner component that displays a banner for cookie consent.
export default function CookieBanner() {
    const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Retrieve cookie consent status from local storage on component mount
    useEffect(() => {
        const storedCookieConsent = getLocalStorage("cookie_consent", null);
        
        setCookieConsent(storedCookieConsent);
        setIsLoading(false);
    }, []);

    // Update local storage and Google Analytics consent status when cookieConsent changes
    useEffect(() => {
        if (cookieConsent !== null) {
            setLocalStorage("cookie_consent", cookieConsent);
        }

        const newValue = cookieConsent ? "granted" : "denied";

        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: newValue,
            });
        }
    }, [cookieConsent]);

    // Do not render the banner if loading or consent is already given
    if (isLoading || cookieConsent !== null) {
        return null;
    }

    return (
        <div className="bg-blue-100 shadow-topShadow mx-4 lg:m-0 rounded-lg lg:rounded-none sticky bottom-48 lg:bottom-0 z-50">
            <div className="cookie-banner-inner">
                <h2 className="m-2 p-4 font-semibold text-lg">Ρυθμίσεις και Πολιτική Cookies</h2>
                <div className="m-2 p-4 flex flex-col md:flex-row align-middle items-center justify-between">
                    <div>
                        <p className="text-center">Χρησιμοποιούμε cookies για να κάνουμε ακόμα καλύτερη την εμπειρία σας στο site μας και για να διασφαλιστεί η αποτελεσματική λειτουργία της ιστοσελίδα μας. Επιλέγοντας «Αποδοχή» παρέχετε τη συγκατάθεση σας για τη χρήση των cookies, σύμφωνα με την πολιτική μας.</p>
                    </div>
                    <div className="flex mt-4 gap-2">
                        <button className="px-4 py-2 text-white font-semibold bg-red-600 hover:shadow-md" onClick={() => setCookieConsent(false)}>
                            Απόρριψη
                        </button>
                        <button className="px-4 py-2 text-white font-semibold bg-green-700 hover:shadow-md" onClick={() =>{ setCookieConsent(true)}}>
                            Αποδοχή
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}