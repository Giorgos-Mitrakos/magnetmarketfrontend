import { getCookieConsent } from "@/lib/helpers/cookies";
import CookieBannerClient from "./cookieBannerClient";

export default function CookieBannerWrapper() {
  const consent = getCookieConsent();

  if (consent) return null;

  return <CookieBannerClient />;
}