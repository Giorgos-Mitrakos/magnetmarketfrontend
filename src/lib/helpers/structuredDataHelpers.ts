// lib/helpers/structuredDataHelpers.ts

import type {
  Graph,
  BreadcrumbList,
  CollectionPage,
  ItemList,
  WebSite,
  WebPage,
  ImageObject,
} from 'schema-dts'
import { organizationStructuredData, storeStructuredData } from './structureData'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* ==================== Types ==================== */

interface Breadcrumb {
  title: string
  slug: string
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number
  image?: { url: string; alternativeText?: string }
}

interface CategoryStructuredDataProps {
  breadcrumbs: Breadcrumb[]
  categoryName: string
  categoryDescription?: string
  products: Product[]
  currentPage: number
  totalPages: number
  baseUrl: string
}

interface HomepageStructuredDataProps {
  featuredCategories?: Array<{
    name: string
    slug: string
    imageUrl: string | null
  }>
  featuredBrands?: Array<{
    name: string
    slug: string
    logoUrl: string | null
  }>
  heroImages?: string[]
}

/* ==================== Website Node ==================== */

export const websiteNode: WebSite = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Magnet Market',
  publisher: {
    '@id': `${BASE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    // @ts-ignore - query-input is valid but not in types
    'query-input': 'required name=search_term_string',
  },
}

/* ==================== Category Structured Data ==================== */

/**
 * Δημιουργεί πλήρες @graph structured data για category pages
 * Περιλαμβάνει: Organization, Store, Website, BreadcrumbList, CollectionPage, ItemList
 */
export function generateCategoryStructuredData({
  breadcrumbs,
  categoryName,
  categoryDescription,
  products,
  currentPage,
  totalPages,
  baseUrl,
}: CategoryStructuredDataProps): Graph {

  const baseUrlWithoutQuery = baseUrl.split('?')[0]

  /* -------------------- BreadcrumbList -------------------- */
  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${baseUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.title,
      ...(index < breadcrumbs.length - 1 && {
        item: `${BASE_URL}${crumb.slug}`,
      }),
    })),
  }

  /* -------------------- CollectionPage -------------------- */
  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    '@id': `${baseUrl}#webpage`,
    url: baseUrl,
    name: categoryName,
    description: categoryDescription || `Προϊόντα κατηγορίας ${categoryName}`,
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    breadcrumb: {
      '@id': `${baseUrl}#breadcrumb`,
    },
  }

  // Pagination links
  if (totalPages > 1) {
    if (currentPage > 1) {
      const prevUrl = currentPage === 2
        ? baseUrlWithoutQuery
        : `${baseUrlWithoutQuery}?page=${currentPage - 1}`
      // @ts-ignore - previousItem is valid but not in official types
      collectionPage.previousItem = prevUrl
    }

    if (currentPage < totalPages) {
      const nextUrl = `${baseUrlWithoutQuery}?page=${currentPage + 1}`
      collectionPage.relatedLink = nextUrl
      // @ts-ignore - nextItem is valid but not in official types
      collectionPage.nextItem = nextUrl
    }
  }

  /* -------------------- ItemList (Products) -------------------- */
  const itemList: ItemList = {
    '@type': 'ItemList',
    '@id': `${baseUrl}#itemlist`,
    url: baseUrl,
    name: totalPages > 1
      ? `${categoryName} - Σελίδα ${currentPage} από ${totalPages}`
      : categoryName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * 12 + index + 1,
      url: `${BASE_URL}/product/${product.slug}`,
      name: product.name,
    })),
  }

  /* -------------------- @graph Assembly -------------------- */
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationStructuredData,
      storeStructuredData,
      websiteNode,
      breadcrumbList,
      collectionPage,
      itemList,
    ],
  }
}

/* ==================== Brand Products Page Structured Data ==================== */

interface BrandProductsStructuredDataProps {
  brandName: string
  brandSlug: string
  products: Array<{
    id: number
    name: string
    slug: string
    price: number
    sale_price?: number
  }>
  currentPage: number
  totalPages: number
  baseUrl: string
  availableCategories?: string[]
}

/**
 * Δημιουργεί structured data για την brand products page
 * Περιλαμβάνει: Organization, Store, Website, WebPage, BreadcrumbList, CollectionPage, ItemList (products)
 */
export function generateBrandProductsStructuredData({
  brandName,
  brandSlug,
  products,
  currentPage,
  totalPages,
  baseUrl,
  availableCategories = [],
}: BrandProductsStructuredDataProps): any {

  const brandPageUrl = `${BASE_URL}/brands/${brandSlug}`
  const baseUrlWithoutQuery = baseUrl.split('?')[0]

  /* -------------------- BreadcrumbList -------------------- */
  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${baseUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Κατασκευαστές',
        item: `${BASE_URL}/brands`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brandName,
        item: brandPageUrl,
      },
    ],
  }

  /* -------------------- CollectionPage -------------------- */
  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    '@id': `${baseUrl}#webpage`,
    url: baseUrl,
    name: `Προϊόντα ${brandName}`,
    description: `Ανακαλύψτε προϊόντα ${brandName} με εγγύηση ελληνικής αντιπροσωπείας`,
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@type': 'Brand',
      '@id': `${brandPageUrl}#brand`,
      name: brandName,
      url: brandPageUrl,
    },
    breadcrumb: {
      '@id': `${baseUrl}#breadcrumb`,
    },
    inLanguage: 'el-GR',
  }

  // Pagination links
  if (totalPages > 1) {
    if (currentPage > 1) {
      const prevUrl = currentPage === 2
        ? baseUrlWithoutQuery
        : `${baseUrlWithoutQuery}?page=${currentPage - 1}`
      // @ts-ignore
      collectionPage.previousItem = prevUrl
    }

    if (currentPage < totalPages) {
      const nextUrl = `${baseUrlWithoutQuery}?page=${currentPage + 1}`
      collectionPage.relatedLink = nextUrl
      // @ts-ignore
      collectionPage.nextItem = nextUrl
    }
  }

  /* -------------------- Products ItemList -------------------- */
  const itemList: ItemList = {
    '@type': 'ItemList',
    '@id': `${baseUrl}#itemlist`,
    url: baseUrl,
    name: totalPages > 1
      ? `${brandName} Προϊόντα - Σελίδα ${currentPage} από ${totalPages}`
      : `${brandName} Προϊόντα`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * 12 + index + 1,
      url: `${BASE_URL}/product/${product.slug}`,
      name: product.name,
    })),
  }

  /* -------------------- Categories ItemList (if available) -------------------- */
  const categoriesItemList: ItemList | null = availableCategories.length > 0
    ? {
      '@type': 'ItemList',
      '@id': `${brandPageUrl}#categories`,
      name: `Κατηγορίες ${brandName}`,
      numberOfItems: availableCategories.length,
      itemListElement: availableCategories.slice(0, 10).map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: cat,
      })),
    }
    : null

  /* -------------------- @graph Assembly -------------------- */
  const graph: any[] = [
    organizationStructuredData,
    storeStructuredData,
    websiteNode,
    breadcrumbList,
    collectionPage,
    itemList,
  ]

  if (categoriesItemList) graph.push(categoriesItemList)

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/* ==================== Subcategories ItemList ==================== */

/**
 * Δημιουργεί ItemList για subcategories (χρησιμοποιείται σε level 1 & 2)
 */
export function generateSubcategoriesItemList({
  categoryName,
  categories,
  baseUrl,
}: {
  categoryName: string
  categories: Array<{ name: string; slug: string }>
  baseUrl: string
}): ItemList {
  return {
    '@type': 'ItemList',
    '@id': `${baseUrl}#subcategories`,
    name: `Υποκατηγορίες ${categoryName}`,
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cat.name,
      url: `${baseUrl}/${cat.slug}`,
    })),
  }
}

/* ==================== Homepage Structured Data ==================== */

/**
 * Δημιουργεί advanced structured data για την αρχική σελίδα
 * Περιλαμβάνει: Organization, Store, Website, WebPage, BreadcrumbList, ItemList (categories & brands)
 */
export function generateHomepageStructuredData({
  featuredCategories = [],
  featuredBrands = [],
  heroImages = [],
}: HomepageStructuredDataProps = {}): any {

  /* -------------------- BreadcrumbList (Homepage) -------------------- */
  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
    ],
  }

  /* -------------------- WebPage -------------------- */
  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/#webpage`,
    url: BASE_URL,
    name: 'Magnet Market - Αρχική Σελίδα',
    description: 'Ηλεκτρονικό κατάστημα τεχνολογίας με τις καλύτερες τιμές σε υπολογιστές, laptops, smartphones και άλλα προϊόντα τεχνολογίας',
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@id': `${BASE_URL}/#organization`,
    },
    breadcrumb: {
      '@id': `${BASE_URL}/#breadcrumb`,
    },
    inLanguage: 'el-GR',
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        // @ts-ignore - query-input is valid but not in types
        'query-input': 'required name=search_term_string',
      },
    ],
  }

  // Πρόσθεσε hero images αν υπάρχουν
  if (heroImages.length > 0) {
    // @ts-ignore - ImageObject typing issue with width/height
    webPage.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: heroImages[0],
      width: '1920',
      height: '1080',
    }
  }

  /* -------------------- Categories ItemList -------------------- */
  const categoriesItemList: ItemList | null = featuredCategories.length > 0
    ? {
      '@type': 'ItemList',
      '@id': `${BASE_URL}/#featured-categories`,
      name: 'Δημοφιλείς Κατηγορίες',
      numberOfItems: featuredCategories.length,
      itemListElement: featuredCategories.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: cat.name,
        url: `${BASE_URL}/category/${cat.slug}`,
        ...(cat.imageUrl && {
          image: cat.imageUrl,
        }),
      })),
    }
    : null

  /* -------------------- Brands ItemList -------------------- */
  const brandsItemList: ItemList | null = featuredBrands.length > 0
    ? {
      '@type': 'ItemList',
      '@id': `${BASE_URL}/#featured-brands`,
      name: 'Δημοφιλείς Κατασκευαστές',
      numberOfItems: featuredBrands.length,
      itemListElement: featuredBrands.map((brand, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: brand.name,
        url: `${BASE_URL}/brands/${brand.slug}`,
        ...(brand.logoUrl && {
          image: brand.logoUrl,
        }),
      })),
    }
    : null

  /* -------------------- @graph Assembly -------------------- */
  const graph: any[] = [
    organizationStructuredData,
    storeStructuredData,
    websiteNode,
    breadcrumbList,
    webPage,
  ]

  // Πρόσθεσε ItemLists αν υπάρχουν
  if (categoriesItemList) graph.push(categoriesItemList)
  if (brandsItemList) graph.push(brandsItemList)

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/* ==================== Brands Page Structured Data ==================== */

interface BrandsStructuredDataProps {
  brands: Array<{
    name: string
    slug: string
    logoUrl: string | null
  }>
}

/**
 * Δημιουργεί structured data για την brands page
 * Περιλαμβάνει: Organization, Store, Website, WebPage, BreadcrumbList, ItemList (brands)
 */
export function generateBrandsStructuredData({
  brands = [],
}: BrandsStructuredDataProps): any {

  /* -------------------- BreadcrumbList -------------------- */
  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/brands#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Κατασκευαστές',
        item: `${BASE_URL}/brands`,
      },
    ],
  }

  /* -------------------- WebPage -------------------- */
  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/brands#webpage`,
    url: `${BASE_URL}/brands`,
    name: 'Κατασκευαστές Προϊόντων Τεχνολογίας',
    description: 'Ανακαλύψτε τους κορυφαίους κατασκευαστές τεχνολογίας που συνεργαζόμαστε για προϊόντα υψηλής ποιότητας',
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@id': `${BASE_URL}/#organization`,
    },
    breadcrumb: {
      '@id': `${BASE_URL}/brands#breadcrumb`,
    },
    inLanguage: 'el-GR',
  }

  /* -------------------- Brands ItemList -------------------- */
  const brandsItemList: ItemList = {
    '@type': 'ItemList',
    '@id': `${BASE_URL}/brands#brandslist`,
    name: 'Διαθέσιμοι Κατασκευαστές',
    numberOfItems: brands.length,
    itemListElement: brands.map((brand, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Brand',
        '@id': `${BASE_URL}/brands/${brand.slug}`,
        name: brand.name,
        url: `${BASE_URL}/brands/${brand.slug}`,
        ...(brand.logoUrl && {
          logo: brand.logoUrl,
        }),
      },
    })),
  }

  /* -------------------- @graph Assembly -------------------- */
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationStructuredData,
      storeStructuredData,
      websiteNode,
      breadcrumbList,
      webPage,
      brandsItemList,
    ],
  }
}

/* ==================== Legacy Functions (Backward Compatibility) ==================== */

/**
 * @deprecated Use generateCategoryStructuredData instead
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Breadcrumb[]) {
  const breadcrumbList = breadcrumbs.map((breadcrumb, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": breadcrumb.title,
    "item": `${BASE_URL}${breadcrumb.slug}`
  }))

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbList
  }
}

/**
 * @deprecated Use generateCategoryStructuredData instead
 */
export function getCategoryStructuredData(breadcrumbs: Breadcrumb[]) {
  const structuredData = []
  structuredData.push(generateBreadcrumbStructuredData(breadcrumbs))
  structuredData.push(organizationStructuredData)
  return structuredData
}