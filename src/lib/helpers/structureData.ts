export const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "OnlineBusiness",
    // "image": `${process.env.NEXT_PUBLIC_API_URL}`,
    "url": "https://www.magnetmarket.gr",
    "sameAs": ["https://www.facebook.com/magnetmarket.gr/",
        "https://www.instagram.com/magnetmarket.gr/",
        "https://www.skroutz.gr/shop/20095/Magnet-Market",
        "https://www.skroutz.cy/shop/20095/Magnet-Market",
        "https://shopflix.gr/merchants/MER814/magnet-market",
        "https://www.xo.gr/profile/profile-911678212/el/",
        "https://www.vrisko.gr/details/170iag2kbj5c2a_f2j_g_5407_364346"],
    // "logo": "https://www.example.com/images/logo.png",
    "name": "ΨΗΦΙΑΚΟΙ ΟΡΙΖΟΝΤΕΣ Ο.Ε.",
    "description": "Ηλεκτρονικό κατάστημα ειδών τεχνολογίας",
    "email": "info@magnetmarket.gr",
    "telephone": "2221121657",
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
            "Friday",
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
    "vatID": '801632015',
    "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": ["GR"],
        "returnPolicyCountry": "GR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
        "refundType": "https://schema.org/FullRefund"
    }
}