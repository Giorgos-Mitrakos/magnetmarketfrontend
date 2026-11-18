// (2026-10-26) Όνομα «Magnet Market» (η Ο.Ε. ως νομική επωνυμία), εξυπηρέτηση σε όλη
// την Ελλάδα, επιστροφή με έξοδα του πελάτη. Μεταφορικά / ωράριο / τηλέφωνο έρχονται από
// τις ρυθμίσεις της Strapi (lib/queries/storeInfo) — όχι σταθερά εδώ.
import type { MerchantReturnPolicy, OfferShippingDetails, OpeningHoursSpecification, Organization, Store } from 'schema-dts';
import type { ShippingTier, StoreInfo } from '../queries/storeInfo';

/** Επιστροφές: 14 ημέρες, με courier/ταχυδρομείο, τα έξοδα επιστροφής τα πληρώνει ο πελάτης */
export function returnPolicy(): MerchantReturnPolicy {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'GR',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  }
}

export const organizationStructuredData: Organization = {
  '@type': 'Organization',
  '@id': 'https://magnetmarket.gr/#organization',

  name: 'Magnet Market',
  legalName: 'ΨΗΦΙΑΚΟΙ ΟΡΙΖΟΝΤΕΣ Ο.Ε.',
  description: 'Ηλεκτρονικό κατάστημα ειδών τεχνολογίας',

  url: 'https://magnetmarket.gr',
  logo: 'https://magnetmarket.gr/MARKET%20MAGNET-LOGO.png',
  image: 'https://magnetmarket.gr/MM-LOGO-220-02.jpg',

  email: 'info@magnetmarket.gr',
  telephone: '+30-2221121657',
  vatID: "801632015",
  taxID: "801632015",

  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Απολλόδωρου του Κυζικηνού',
    addressLocality: 'Νέα Αρτάκη',
    addressRegion: 'Ευβοίας',
    postalCode: '34600',
    addressCountry: 'GR',
  },

  hasMerchantReturnPolicy: returnPolicy(),

  founders: [ // Optional but good for local business
    {
      "@type": "Person",
      "name": "Κουλογιάννης Κωνσταντίνος" // Add actual founder name if available
    },
    {
      "@type": "Person",
      "name": "Μητράκος Γιώργος" // Add actual founder name if available
    }
  ],

  sameAs: [
    'https://www.facebook.com/magnetmarket.gr/',
    'https://www.instagram.com/magnetmarket.gr/',
    'https://www.skroutz.gr/shop/20095/Magnet-Market',
    'https://www.bestprice.gr/m/12328/magnet-market.html',
    'https://shopflix.gr/merchants/MER814/magnet-market',
    'https://www.xo.gr/profile/profile-911678212/el/',
    'https://www.vrisko.gr/details/170iag2kbj5c2a_f2j_g_5407_364346',
  ],
};

export const storeStructuredData: Store = {
  '@type': 'Store',
  '@id': 'https://magnetmarket.gr/#store',

  name: 'Magnet Market',
  url: 'https://magnetmarket.gr',

  parentOrganization: {
    '@id': 'https://magnetmarket.gr/#organization',
  },

  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Απολλόδωρου του Κυζικηνού',
    addressLocality: 'Νέα Αρτάκη',
    postalCode: '34600',
    addressCountry: 'GR',
  },


  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.50405304255828,
    longitude: 23.638401898227063,
  },

  priceRange: '€€',

  // Αποστολές σε όλη την Ελλάδα (το φυσικό κατάστημα είναι στη Νέα Αρτάκη)
  areaServed: { '@type': 'Country', name: 'GR' },

  paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'],

  currenciesAccepted: 'EUR',

  knowsLanguage: ['el', 'en'], // Greek, English
};

/** Το κατάστημα με ωράριο / τηλέφωνο από τις ρυθμίσεις (αρχική σελίδα) */
export function storeWithInfo(info: StoreInfo | null): Store {
  if (!info) return storeStructuredData
  const hours: OpeningHoursSpecification[] | undefined = info.openingHours?.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days as any,
    opens: h.opens,
    closes: h.closes,
  }))
  return {
    ...(storeStructuredData as unknown as Record<string, unknown>),
    ...(info.contact.telephone ? { telephone: info.contact.telephone } : {}),
    ...(info.contact.email ? { email: info.contact.email } : {}),
    ...(hours?.length ? { openingHoursSpecification: hours } : {}),
  } as Store
}

/** Κόστος courier για δέμα με αυτό το βάρος (ίδιος υπολογισμός με το checkout) */
function tierFee(t: ShippingTier, weightGrams: number): number {
  const extraKg = Math.max(0, weightGrams - t.basicWeightGrams) / 1000
  return Math.round((t.basicFee + extraKg * t.feePerKgAbove) * 100) / 100
}

/**
 * Μεταφορικά ενός προϊόντος για τη Google (μία εγγραφή για την Ελλάδα, με την τιμή
 * της ηπειρωτικής — αυτή που πληρώνουν οι περισσότεροι). Δωρεάν όταν η τιμή του
 * προϊόντος φτάνει το όριο δωρεάν αποστολής. Χωρίς στοιχεία → τίποτα (όχι λάθος τιμή).
 */
export function shippingDetailsFor(price: number, weightGrams: number | null | undefined, info: StoreInfo | null): OfferShippingDetails[] | undefined {
  const t = info?.shipping.mainland
  if (!info || !t) return undefined
  const free = info.shipping.freeOver != null && price >= info.shipping.freeOver
  const fee = free ? 0 : tierFee(t, Number(weightGrams) || 0)
  return [
    {
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GR' },
      shippingRate: { '@type': 'MonetaryAmount', value: fee, currency: 'EUR' },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: info.delivery.handlingDays[0], maxValue: info.delivery.handlingDays[1], unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: info.delivery.transitDays[0], maxValue: info.delivery.transitDays[1], unitCode: 'DAY' },
      },
    },
  ]
}
