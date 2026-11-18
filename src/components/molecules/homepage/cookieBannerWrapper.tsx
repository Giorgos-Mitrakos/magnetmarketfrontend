import { hasCookieChoice } from "@/lib/helpers/cookies";
import CookieBannerClient from "./cookieBannerClient";

export default async function CookieBannerWrapper() {
  // Το banner εμφανίζεται μόνο όσο ο επισκέπτης δεν έχει απαντήσει —
  // και η «Απόρριψη» είναι απάντηση (cookie_consent=false)
  if (await hasCookieChoice()) return null;

  return <CookieBannerClient consent={false} />;
}