import { cookies } from "next/headers";

export function getCookieConsent(): boolean {
    const cookie = cookies().get("cookie_consent");
    return cookie?.value === "true";
}