// app/product/[slug]/page.tsx

import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'
import { FaRegImage } from 'react-icons/fa'

import Breadcrumb from '@/components/molecules/breadcrumb'
import Newsletter from '@/components/molecules/newsletter'
import ProductBasicFeatures from '@/components/organisms/productBasicFeatures'
import SiteFeaturesFromAdmin from '@/components/organisms/siteFeaturesFromAdmin'
import SimilarProducts from '@/components/organisms/similarProducts'
import ProductInfo from '@/components/organisms/productInfo'
import ProductVideos from '@/components/organisms/productVideos'
import ProductBundles from '@/components/organisms/productBundles'
import ProductQA from '@/components/organisms/productQA'
import ProductReviews from '@/components/organisms/reviews/ProductReviews'
import ProductImageWidget from '@/components/molecules/productImageWidget'

import {
  organizationStructuredData,
  returnPolicy,
  shippingDetailsFor,
  storeStructuredData,
} from '@/lib/helpers/structureData'
import { getStoreInfo, type StoreInfo } from '@/lib/queries/storeInfo'
import type {
  WithContext,
  Graph,
  Product,
  BreadcrumbList,
  Organization,
  LocalBusiness,
  Brand,
  ItemAvailability,
  Offer,
  VideoObject,
} from 'schema-dts';

import { IProductCard, IProductPage, TProductPage } from '@/lib/interfaces/product'
import Link from 'next/link'
import { ProductStatus } from '@/lib/helpers/availabilityHelper'
import ProductImageWidgetWrapper from '@/components/molecules/productImageWidgetWrapper'
import Carousel from '@/components/atoms/carousel'
import RecentlyViewed from '@/components/molecules/RecentlyViewed'
import TrackRecentlyViewed from '@/components/atoms/TrackRecentlyViewed'
import PriceHistory from '@/components/molecules/PriceHistory'
import { storefrontFetch } from '@/lib/helpers/storefrontApi'
import { PreorderPassView } from '@/lib/interfaces/preorder'
import { plainText, sanitizeProductHtml } from '@/lib/helpers/sanitizeHtml'
import { jsonLd } from '@/lib/helpers/jsonLd'
import { autoProductDescription, autoProductTitle } from '@/lib/helpers/productSeo'
import { getStrapiMedia } from '@/repositories/medias'

// (2026-11-26) Πάντα φρέσκια σε κάθε επίσκεψη: τιμή/απόθεμα αλλάζουν συνεχώς από τα imports (το webhook
// του Strapi δεν ανανεώνει προϊόντα). Αφαιρέθηκαν τα revalidate/generateStaticParams, που μετά την
// αφαίρεση του session από το layout έκαναν το Next να τη θεωρεί στατική (● στο build) με cache 24 ωρών.
export const dynamic = 'force-dynamic'

type MetadataProps = {
  params: { slug: string }
}

interface IBreadcrumb {
  title: string
  slug: string
}

interface ICategory {
  id: number
  name: string
  slug: string
  parents?: ICategory[]
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function isValidProductSlug(slug: string): boolean {
  return (
    typeof slug === 'string' &&
    slug.length >= 2 &&
    slug.length <= 5000 &&
    !slug.includes('..')
  )
}

/**
 * (2026-10-22) cache(): το generateMetadata και η σελίδα ζητούσαν το προϊόν
 * ΔΥΟ φορές από το Strapi σε κάθε επίσκεψη — τώρα μία ανά αίτημα.
 * 404 μόνο όταν το Strapi λέει «δεν βρέθηκε»· σε άλλο σφάλμα (π.χ. Strapi
 * εκτός) σελίδα σφάλματος, ώστε η Google να μη σβήσει το προϊόν ως 404.
 */
const getProductData = cache(async (slug: string): Promise<TProductPage> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/product/getProductBySlug`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      cache: 'no-store',
    }
  )
  if (response.status === 404) notFound()
  if (!response.ok) throw new Error(`Αποτυχία φόρτωσης προϊόντος (${response.status})`)

  const data = await response.json()
  // (2026-10-28) Το προϊόν συγχωνεύτηκε σε άλλο (διπλό): μόνιμη ανακατεύθυνση στο κύριο
  if (typeof data?.redirect === 'string' && data.redirect && data.redirect !== slug) {
    permanentRedirect(`/product/${encodeURIComponent(data.redirect)}`)
  }
  if (!data?.product) notFound()
  return data
})

/**
 * (2026-10-22) Δόσεις / δωρεάν μεταφορικά για την τιμή του προϊόντος, από
 * τους ενεργούς τρόπους αποστολής/πληρωμής — πάντα φρέσκα (χωρίς cache του
 * Next: μια αλλαγή στο Strapi, π.χ. όριο δωρεάν μεταφορικών, φαίνεται αμέσως).
 */
type ProductPerks = {
  freeInstallments: number
  maxInstallments: number
  freeShipping: { over: number, name: string } | null
}

async function getProductPerks(price: number): Promise<ProductPerks> {
  const perks: ProductPerks = { freeInstallments: 0, maxInstallments: 0, freeShipping: null }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storefront/shipping-methods`, {
      cache: 'no-store',
    })
    if (!res.ok) return perks
    const json = await res.json()
    for (const s of json?.shippings?.data ?? []) {
      const over = Number(s?.attributes?.free_shipping_over)
      if (over > 0 && (!perks.freeShipping || over < perks.freeShipping.over)) {
        perks.freeShipping = { over, name: String(s.attributes.name ?? '') }
      }
      for (const p of s?.attributes?.payments?.data ?? []) {
        const inst = p?.attributes?.installments
        if (!inst) continue
        const range = p.attributes.range
        if (range && (price < Number(range.minimum ?? 0) || (range.maximum != null && price > Number(range.maximum)))) continue
        const max = Number(inst.max_installments) || 0
        perks.maxInstallments = Math.max(perks.maxInstallments, max)
        perks.freeInstallments = Math.max(perks.freeInstallments, Math.min(Number(inst.free_rate_months) || 0, max))
      }
    }
  } catch {
    /* χωρίς πληροφορίες δόσεων — η σελίδα δουλεύει κανονικά */
  }
  return perks
}

/** GTIN μόνο αν είναι έγκυρο (8/12/13/14 ψηφία με σωστό check digit) */
function validGtin(code: string | null | undefined): string | undefined {
  const c = String(code ?? '').trim()
  if (!/^(\d{8}|\d{12,14})$/.test(c)) return undefined
  const digits = c.split('').map(Number)
  const check = digits.pop()!
  const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === check ? c : undefined
}

function generateBreadcrumbsRecursive(product: IProductPage): IBreadcrumb[] {
  const breadcrumbs: IBreadcrumb[] = [{ title: 'Αρχική', slug: '/' }]

  function collect(category: ICategory | null, acc: ICategory[] = []) {
    if (!category) return acc
    acc.unshift(category)
    return collect(category.parents?.[0] ?? null, acc)
  }

  const categories = collect(product.category)

  categories.forEach((cat, index) => {
    const path = categories.slice(0, index + 1).map(c => c.slug).join('/')
    breadcrumbs.push({
      title: cat.name,
      slug: `/category/${path}`,
    })
  })

  breadcrumbs.push({
    title: product.name,
    slug: `/product/${product.slug}`,
  })

  return breadcrumbs
}

/**
 * (2026-10-22) Σύνδεσμος προπαραγγελίας (?pp=…) για προϊόν «Αναμένεται»: ο
 * έλεγχος γίνεται στο Strapi — και ξανά στην παραγγελία.
 */
async function getPreorderPass(token: string | undefined, productDocumentId: string): Promise<PreorderPassView | null> {
  const t = typeof token === 'string' ? token.trim() : ''
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(t) || !productDocumentId) return null
  try {
    const res = await storefrontFetch<any>(
      `/storefront/preorder-pass?token=${encodeURIComponent(t)}&product=${encodeURIComponent(productDocumentId)}`
    )
    return res?.valid
      ? { token: t, valid: true, maxQuantity: Number(res.maxQuantity) || 1, expiresAt: res.expiresAt ?? null, note: res.note ?? null, emailBound: !!res.emailBound }
      : { token: t, valid: false, message: res?.message || 'Ο σύνδεσμος προπαραγγελίας δεν είναι έγκυρος.' }
  } catch {
    return { token: t, valid: false, message: 'Δεν ήταν δυνατός ο έλεγχος του συνδέσμου προπαραγγελίας — δοκιμάστε ξανά.' }
  }
}

/* -------------------------------------------------------------------------- */
/*                          Schema helpers (SEO)                               */
/* -------------------------------------------------------------------------- */

function getSchemaAvailability(
  status: ProductStatus,
  inventory: number
): ItemAvailability {
  // (2026-10-22) «Κατόπιν παραγγελίας» = δεν είναι σε απόθεμα, το φέρνουμε
  // από τον προμηθευτή μετά την παραγγελία → BackOrder (PreOrder σημαίνει
  // προϊόν που δεν έχει κυκλοφορήσει). «Αναμένεται» δεν παραγγέλνεται από το
  // site (μόνο με προσωπικό σύνδεσμο) → OutOfStock.
  void inventory
  if (status === 'Backorder')
    return 'https://schema.org/BackOrder'
  if (status === 'IsExpected' || status === 'OutOfStock')
    return 'https://schema.org/OutOfStock'
  if (status === 'Discontinued')
    return 'https://schema.org/Discontinued'
  return 'https://schema.org/InStock'
}

function getOfferData(product: IProductPage, storeInfo: StoreInfo | null): Offer {
  const salePrice = product.is_sale && product.sale_price ? product.sale_price : null
  const shippingDetails = shippingDetailsFor(salePrice ?? product.price, product.weight, storeInfo)
  return {
    '@type': 'Offer',
    url: `${process.env.NEXT_URL}/product/${product.slug}`,
    priceCurrency: 'EUR',
    price: salePrice ?? product.price,
    availability: getSchemaAvailability(
      product.status as ProductStatus,
      product.inventory
    ),
    itemCondition: 'https://schema.org/NewCondition',
    // Προσφορά με λήξη: μέχρι τότε ισχύει η τιμή
    priceValidUntil: (salePrice && product.sale_ends_at
      ? new Date(product.sale_ends_at)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    )
      .toISOString()
      .split('T')[0],
    seller: {
      '@type': 'Organization',
      name: 'Magnet Market',
    },

    // (2026-10-26) Από τις μεταφορικές της Strapi (με το όριο δωρεάν αποστολής)
    ...(shippingDetails ? { shippingDetails } : {}),

    hasMerchantReturnPolicy: returnPolicy(),
  }
}

/* -------------------------------------------------------------------------- */
/*                                Page                                        */
/* -------------------------------------------------------------------------- */

export default async function ProductPage(
  props: {
    params: Promise<{ slug: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!isValidProductSlug(params.slug)) notFound()

  const data = await getProductData(params.slug)
  const product = data.product

  // Σύνδεσμος προπαραγγελίας: μόνο για «Αναμένεται»
  const ppParam = searchParams?.pp
  const effectivePrice = product.is_sale && product.sale_price ? product.sale_price : product.price
  const [preorder, perks, storeInfo] = await Promise.all([
    product.status === 'IsExpected'
      ? getPreorderPass(Array.isArray(ppParam) ? ppParam[0] : ppParam, product.documentId ?? '')
      : Promise.resolve(null),
    product.status === 'AskForPrice' || product.price == null ? Promise.resolve(null) : getProductPerks(effectivePrice),
    getStoreInfo(),
  ])

  // Περιγραφές από feeds προμηθευτών: καθάρισμα ΣΤΟΝ SERVER
  const descriptionHtml = sanitizeProductHtml(product.description)
  const shortDescriptionHtml = sanitizeProductHtml(product.short_description)

  const breadcrumbs = generateBreadcrumbsRecursive(product)

  const images =
    product.image || product.additionalImages?.length
      ? [
        ...(product.image
          ? [product.image]
          : []),
        ...(product.additionalImages ?? []),
      ]
      : []

  /* ==================== Structured Data Generation ==================== */

  const productImages: string[] = [product.image, ...(product.additionalImages ?? [])]
    .filter(Boolean)
    .map(img => getStrapiMedia(img.url))
    .filter((u): u is string => !!u)

  const breadcrumbNode: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${process.env.NEXT_URL}/product/${product.slug}#breadcrumb`,
    itemListElement: breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.title,
      item: `${process.env.NEXT_URL}${b.slug}`,
    })),
  };

  const brandNode: Brand | undefined = product.brand
    ? {
      '@type': 'Brand',
      '@id': `${process.env.NEXT_URL}/#brand-${product.brand.slug}`,
      name: product.brand.name,
      logo: product.brand.logo ? getStrapiMedia(product.brand.logo.url) ?? undefined : undefined,
    }
    : undefined;

  const videoNodes: VideoObject[] = (product.videos ?? [])
    .filter(v => v.thumbnail && v.addedAt)
    .map(v => ({
      '@type': 'VideoObject',
      name: v.title || `${product.name} — video`,
      description: v.title || `Video για το ${product.name}`,
      thumbnailUrl: v.thumbnail as string,
      uploadDate: v.addedAt as string,
      embedUrl: v.embedUrl.split('?')[0],
      contentUrl: v.url,
    }))

  const productNode: Product = {
    '@type': 'Product',
    '@id': `${process.env.NEXT_URL}/product/${product.slug}`,
    name: product.name,
    description: plainText(product.description || product.short_description, 500) || undefined,
    sku: product.id.toString(),
    mpn: product.mpn || undefined,
    gtin: validGtin(product.barcode),
    image: productImages,
    category: product.category?.name,
    brand: brandNode,
    // (2026-10-23) Video — μόνο όσα έχουν μικρογραφία και ημερομηνία (απαιτούνται από τη Google)
    subjectOf: videoNodes.length ? videoNodes : undefined,
    // (2026-10-23) Αξιολογήσεις (μόνο εγκεκριμένες, από επαληθευμένες αγορές)
    aggregateRating: data.reviews?.summary.count
      ? {
          '@type': 'AggregateRating',
          ratingValue: data.reviews.summary.average ?? 0,
          reviewCount: data.reviews.summary.count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    review: data.reviews?.results.length
      ? data.reviews.results.map(r => ({
          '@type': 'Review' as const,
          author: { '@type': 'Person' as const, name: r.name },
          reviewRating: { '@type': 'Rating' as const, ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          ...(r.date ? { datePublished: r.date.slice(0, 10) } : {}),
          ...(r.title ? { name: r.title } : {}),
          ...(r.body ? { reviewBody: r.body } : {}),
        }))
      : undefined,
    // «Ζητήστε τιμή»: χωρίς προσφορά (δεν υπάρχει τιμή πώλησης)
    // (2026-11-19) Και χωρίς τιμή (brand «Ζητήστε τιμή» σε κάθε κατάσταση)
    offers: product.status === 'AskForPrice' || product.price == null ? undefined : {
      ...getOfferData(product, storeInfo),
    },

    // Το βάρος αποστολής αποθηκεύεται σε γραμμάρια
    weight: product.weight ? {
      '@type': 'QuantitativeValue',
      value: product.weight,
      unitCode: 'GRM'
    } : undefined,

    // Διαστάσεις
    width: product.width ? {
      '@type': 'QuantitativeValue',
      value: product.width,
      unitCode: 'CMT'
    } : undefined,

    height: product.height ? {
      '@type': 'QuantitativeValue',
      value: product.height,
      unitCode: 'CMT'
    } : undefined,

    depth: product.length ? {
      '@type': 'QuantitativeValue',
      value: product.length,
      unitCode: 'CMT'
    } : undefined,
  };

  const webPageNode = {
    '@type': 'WebPage',
    '@id': `${process.env.NEXT_URL}/product/${product.slug}#webpage`,
    url: `${process.env.NEXT_URL}/product/${product.slug}`,
    name: product.name,
    description: plainText(product.short_description || product.description, 300) || undefined,
    isPartOf: {
      '@id': `${process.env.NEXT_URL}/#website`
    },
    breadcrumb: {
      '@id': `${process.env.NEXT_URL}/product/${product.slug}#breadcrumb`
    },
    mainEntity: {
      '@id': `${process.env.NEXT_URL}/product/${product.slug}`
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationStructuredData,
      storeStructuredData,
      webPageNode,
      productNode,
      breadcrumbNode,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        suppressHydrationWarning
      />
      <div className="min-h-screen">
        <Breadcrumb breadcrumbs={breadcrumbs} />

        {/* (2026-10-27) Καταργήθηκε: πρώτα το μήνυμα και οι διαθέσιμες εναλλακτικές */}
        {product.discontinued && (
          <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6 dark:border-amber-800 dark:bg-amber-900/20" aria-labelledby="discontinued-title">
            <h2 id="discontinued-title" className="text-lg font-bold text-amber-900 dark:text-amber-100">
              Αυτό το προϊόν δεν διατίθεται πια
            </h2>
            <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
              Ο κατασκευαστής ή ο προμηθευτής σταμάτησε τη διάθεσή του.
              {(data.similarProducts?.length ?? 0) > 0 ? ' Δείτε παρόμοια προϊόντα που μπορείτε να παραγγείλετε τώρα.' : ''}
              {breadcrumbs.length > 2 && (
                <>
                  {' '}
                  <Link href={breadcrumbs[breadcrumbs.length - 2].slug} className="font-semibold underline">
                    Όλα τα προϊόντα: {breadcrumbs[breadcrumbs.length - 2].title}
                  </Link>
                </>
              )}
            </p>
            {(data.similarProducts?.length ?? 0) > 0 && (
              <div className="mt-4">
                <Carousel
                  products={data.similarProducts as unknown as IProductCard[]}
                  listName="Εναλλακτικές για προϊόν που καταργήθηκε"
                  listId="discontinued_alternatives"
                />
              </div>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-9">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 min-w-0 overflow-hidden">
                <ProductImageWidgetWrapper
                  productImage={product.image}
                  additionalImages={product.additionalImages}
                  productName={product.name}
                />
                {(product.videos?.length ?? 0) > 0 && (
                  <a
                    href="#videos"
                    className="m-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-siteColors-purple hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <span aria-hidden>▶</span>
                    {(product.videos?.length ?? 0) > 1 ? `Δείτε τα video (${product.videos?.length})` : 'Δείτε το video'}
                  </a>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 p-6">
                <ProductBasicFeatures
                  product={product}
                  preorder={preorder}
                  shortDescriptionHtml={shortDescriptionHtml}
                  perks={perks}
                  delivery={data.delivery ?? null}
                  rating={data.reviews?.summary.count ? { average: data.reviews.summary.average ?? 0, count: data.reviews.summary.count } : null}
                  compare={data.features?.compare === true}
                />
              </div>
            </div>

            {/* (2026-10-23) Πακέτα «Αγοράστε τα μαζί» (διακόπτης στον Product Manager) */}
            {(data.bundles?.length ?? 0) > 0 && (
              <div className="mt-6">
                <ProductBundles bundles={data.bundles ?? []} currentDocumentId={product.documentId} />
              </div>
            )}

            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl">
              <ProductInfo
                descriptionHtml={descriptionHtml}
                chars={product.prod_chars}
                files={(product.files ?? []).map(f => ({ name: f.name, url: getStrapiMedia(f.url) ?? f.url }))}
                // (2026-10-24) Ερωτήσεις ως καρτέλα: η φόρμα υπάρχει πάντα· λίστα/δημοσίευση μόνο με τον διακόπτη
                questionsLabel={
                  data.features?.publicQa === false
                    ? 'Ερώτηση για το προϊόν'
                    : `Ερωτήσεις${data.qa?.length ? ` (${data.qa.length})` : ''}`
                }
                questions={
                  <ProductQA
                    qa={data.qa ?? []}
                    productId={product.id}
                    productDocumentId={product.documentId}
                    publicEnabled={data.features?.publicQa !== false}
                  />
                }
              />
            </div>

            {/* (2026-10-23) Video προϊόντος (διακόπτης στον Product Manager) */}
            {(product.videos?.length ?? 0) > 0 && (
              <div className="mt-6">
                <ProductVideos videos={product.videos ?? []} productName={product.name} />
              </div>
            )}

            {/* (2026-10-23) Αξιολογήσεις από επαληθευμένες αγορές (διακόπτης στον Product Manager) */}
            {data.reviews && (
              <div className="mt-6">
                <ProductReviews data={data.reviews} productDocumentId={product.documentId} />
              </div>
            )}

            {/* Ιστορικό τιμής: μόνο πραγματικές τιμές του site (≥ 30 μέρες καταγραφής) */}
            {data.priceHistory && (
              <div className="mt-6">
                <PriceHistory history={data.priceHistory} />
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <SimilarProducts
              similarProducts={product.discontinued ? [] : data.similarProducts}
              crossCategories={product.category.cross_categories}
            />
          </div>
        </div>

        {/* Cross-selling: χειροκίνητα «Ταιριάζει με» + συμπληρωματικές κατηγορίες */}
        {data.crossSell && data.crossSell.length > 0 && (
          <section className="mt-12" aria-label="Συχνά αγοράζονται μαζί">
            <h2 className="mb-4 text-xl md:text-2xl font-bold text-siteColors-purple dark:text-slate-200">
              Συχνά αγοράζονται μαζί
            </h2>
            <Carousel products={data.crossSell} listName="Συχνά αγοράζονται μαζί" listId="product_cross_sell" />
          </section>
        )}

        {/* «Είδατε πρόσφατα» (ιστορικό στον browser του επισκέπτη) */}
        <TrackRecentlyViewed documentId={product.documentId} />
        <RecentlyViewed excludeDocumentId={product.documentId} />

        {/* (2026-10-26) Οι παροχές στο τέλος: στην κορυφή έσπρωχναν τη φωτογραφία και την τιμή κάτω στο κινητό */}
        <div className="mt-12">
          <SiteFeaturesFromAdmin />
        </div>

        <div className="mt-12">
          <Newsletter />
        </div>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Metadata                                     */
/* -------------------------------------------------------------------------- */

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;

  if (!isValidProductSlug(params.slug)) {
    return { title: 'Το προϊόν δεν βρέθηκε | Magnet Market', robots: { index: false, follow: true } };
  }

  const data = await getProductData(params.slug);
  const product = data.product;
  const seo = product.seo ?? null;
  const url = `${process.env.NEXT_URL}/product/${product.slug}`;

  /* ----------------------------- Images ----------------------------- */
  const images = [seo?.metaImage, product.image, ...(product.additionalImages ?? [])]
    .filter(Boolean)
    .map(img => getStrapiMedia(img!.url))
    .filter((u): u is string => !!u)
    .slice(0, 6);

  /* ---------------- Τίτλος / περιγραφή: πρώτα από τον Product Manager ---------------- */
  // (2026-10-26) Αλλιώς αυτόματο πρότυπο (lib/helpers/productSeo.ts): μάρκα + όνομα + κατηγορία,
  // χαρακτηριστικά, διαθεσιμότητα και τιμή — αντί για το κείμενο του προμηθευτή (ίδιο σε όλα τα e-shop)
  // Το παλιό αυτόματο SEO του importer (τίτλος = όνομα προμηθευτή, περιγραφή = όνομα + κείμενο
  // προμηθευτή, άρα η περιγραφή ξεκινά με τον τίτλο) δεν μετράει ως χειροκίνητο
  const seoTitle = seo?.metaTitle?.trim() || '';
  const seoDescription = seo?.metaDescription?.trim() || '';
  const legacyAutoSeo = !!seoTitle && !!seoDescription && seoDescription.startsWith(seoTitle);
  // Αυτόματα: πρότυπο της κατηγορίας από το Strapi (Product Manager → Κατηγορία → SEO προϊόντων),
  // αλλιώς το τοπικό προεπιλεγμένο
  const title = (!legacyAutoSeo && seoTitle) || `${data.autoSeo?.title || autoProductTitle(product)} | Magnet Market`;
  const description = (!legacyAutoSeo && seoDescription) || data.autoSeo?.description || autoProductDescription(product);

  const robotsText = (seo?.metaRobots ?? '').toLowerCase();
  // (2026-10-27) Καταργημένο: η σελίδα μένει για όσους έρχονται από παλιούς συνδέσμους,
  // αλλά βγαίνει σιγά-σιγά από τη Google (οι σύνδεσμοί της μετράνε κανονικά)
  const index = !robotsText.includes('noindex') && !product.discontinued;
  const follow = !robotsText.includes('nofollow');

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    robots: {
      index,
      follow,
      googleBot: { index, follow, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    // Χωρίς παραμέτρους (π.χ. ?pp= σύνδεσμος προπαραγγελίας)
    alternates: {
      canonical: seo?.canonicalURL?.trim() || url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Magnet Market',
      locale: 'el_GR',
      images,
      type: 'website',
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(images.length ? { images: [images[0]] } : {}),
    },
  };
}
