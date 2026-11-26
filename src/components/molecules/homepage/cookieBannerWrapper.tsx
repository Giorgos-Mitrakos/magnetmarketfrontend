import CookieBannerClient from "./cookieBannerClient";

// (2026-11-26) Χωρίς ανάγνωση cookies στον server (αλλιώς καμία σελίδα δεν μπορεί να σερβιριστεί από
// cache). Το banner είναι πάντα στο HTML· όποιος έχει ήδη απαντήσει δεν το βλέπει ποτέ: το inline
// script του layout βάζει data-cc στο <html> → CSS display:none, και μετά το component αφαιρείται.
export default function CookieBannerWrapper() {
  return <CookieBannerClient />;
}
