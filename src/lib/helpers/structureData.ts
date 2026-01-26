import type { OfferShippingDetails, Organization, Store } from 'schema-dts';

export const organizationStructuredData: Organization = {
  '@type': 'Organization',
  '@id': 'https://magnetmarket.gr/#organization',

  name: 'ΨΗΦΙΑΚΟΙ ΟΡΙΖΟΝΤΕΣ Ο.Ε.',
  legalName: 'ΨΗΦΙΑΚΟΙ ΟΡΙΖΟΝΤΕΣ Ο.Ε.',
  alternateName: 'Magnet Market',
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

  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "GR",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn"
  },

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

  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  ],

  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.50405304255828,
    longitude: 23.638401898227063,
  },

  priceRange: '€€',

  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 38.50405304255828,
      longitude: 23.638401898227063,
    },
    geoRadius: '50000', // 50km delivery radius
  },

  paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'],

  currenciesAccepted: 'EUR',

  knowsLanguage: ['el', 'en'], // Greek, English
};

// Χερσαίοι προορισμοί
export const mainlandShipping: OfferShippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'GR',
    name: 'Mainland Greece', // Προαιρετικό
  },
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '4.5',
    currency: 'EUR',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
  },
  description: 'Ισχύει για πακέτα έως 3 κιλά',
};

// Νησιωτικοί προορισμοί
export const islandsShipping: OfferShippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'GR',
    name: 'Greek Islands',
  },
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '5.5',
    currency: 'EUR',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
  },
  description: 'Ισχύει για πακέτα έως 3 κιλά',
};

// Δυσπρόσιτοι προορισμοί
export const remoteShipping: OfferShippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'GR',
    name: 'Remote Areas',
  },
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '7.5',
    currency: 'EUR',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 6, unitCode: 'DAY' },
  },
  description: 'Ισχύει για πακέτα έως 3 κιλά',
};
