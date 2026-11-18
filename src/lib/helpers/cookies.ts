import { cookies } from "next/headers";

export async function getCookieConsent(): Promise<boolean> {
    const cookie = (await cookies()).get("cookie_consent");
    
    return cookie?.value === "true";
}

/** true αν ο επισκέπτης έχει ήδη απαντήσει στο banner (Αποδοχή ή Απόρριψη) */
export async function hasCookieChoice(): Promise<boolean> {
    return (await cookies()).has("cookie_consent");
}