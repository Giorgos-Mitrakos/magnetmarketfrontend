export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": ["Organization", "OnlineBusiness"], // Use both types for better coverage
  "name": "ΨΗΦΙΑΚΟΙ ΟΡΙΖΟΝΤΕΣ Ο.Ε.",
  "legalName": "ΨΗΦΙΑΚΟΙ ΟΡΙΖΟΝΤΕΣ Ο.Ε.",
  "alternateName": "Magnet Market",
  "description": "Ηλεκτρονικό κατάστημα ειδών τεχνολογίας",
  "url": "https://magnetmarket.gr",
  "logo": "https://magnetmarket.gr/MARKET MAGNET-LOGO.png", // Add absolute path to your logo
  "image": "https://magnetmarket.gr/MM-LOGO-220-02.jpg", // Add main image
  "email": "info@magnetmarket.gr",
  "telephone": "+30-2221121657", // Add country code
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Απολλόδωρου του Κυζικηνού",
    "addressLocality": "Νέα Αρτάκη",
    "addressCountry": "GR",
    "addressRegion": "Ευβοίας",
    "postalCode": "34600"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 38.512482,
    "longitude": 23.638548
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "11:00",
      "closes": "14:00"
    }
  ],
  "vatID": "801632015",
  "taxID": "801632015",
  "sameAs": [
    "https://www.facebook.com/magnetmarket.gr/",
    "https://www.instagram.com/magnetmarket.gr/",
    "https://www.skroutz.gr/shop/20095/Magnet-Market",
    "https://www.skroutz.cy/shop/20095/Magnet-Market",
    "https://shopflix.gr/merchants/MER814/magnet-market",
    "https://www.xo.gr/profile/profile-911678212/el/",
    "https://www.vrisko.gr/details/170iag2kbj5c2a_f2j_g_5407_364346",
    "https://www.bestprice.gr/m/12328/magnet-market.html"
  ],
  "hasMerchantReturnPolicy": {
    "@type": "MerchantReturnPolicy",
    "applicableCountry": "GR",
    "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
    "merchantReturnDays": 14,
    "returnMethod": "https://schema.org/ReturnByMail",
    "returnFees": "https://schema.org/FreeReturn"
  },
  "priceRange": "€€", // Add price range indicator
  "founders": [ // Optional but good for local business
    {
      "@type": "Person",
      "name": "Κουλογιάννης Κωνσταντίνος" // Add actual founder name if available
    },
    {
      "@type": "Person",
      "name": "Μητράκος Γιώργος" // Add actual founder name if available
    }
  ]
};

export const localBusinessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Magnet Market",
  "description": "Ηλεκτρονικό κατάστημα ειδών τεχνολογίας",
  "url": "https://magnetmarket.gr",
  "telephone": "+30-2221121657",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Απολλόδωρου του Κυζικηνού",
    "addressLocality": "Νέα Αρτάκη",
    "addressCountry": "GR",
    "postalCode": "34600"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 38.512482,
    "longitude": 23.638548
  },
  "openingHours": [
    "Mo-Fr 09:00-17:00",
    "Sa 11:00-14:00"
  ],
  "priceRange": "€€"
};