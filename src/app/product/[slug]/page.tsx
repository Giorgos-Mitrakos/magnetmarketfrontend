// app/product/[slug]/page.tsx

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FaRegImage } from 'react-icons/fa'

import Breadcrumb from '@/components/molecules/breadcrumb'
import Newsletter from '@/components/molecules/newsletter'
import ProductBasicFeatures from '@/components/organisms/productBasicFeatures'
import SiteFeatures from '@/components/organisms/siteFeatures'
import SimilarProducts from '@/components/organisms/similarProducts'
import ProductInfo from '@/components/organisms/productInfo'
import ProductImageWidget from '@/components/molecules/productImageWidget'

import {
  islandsShipping,
  mainlandShipping,
  organizationStructuredData,
  remoteShipping,
  storeStructuredData,
} from '@/lib/helpers/structureData'
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
} from 'schema-dts';

import { IProductPage, TProductPage } from '@/lib/interfaces/product'
import { ProductStatus } from '@/lib/helpers/availabilityHelper'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 86400

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

async function getProductData(slug: string): Promise<TProductPage> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/getProductBySlug`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
        cache: 'no-store',
      }
    )

    if (!response.ok) throw new Error('Product not found')

    const data = await response.json()
    if (!data?.product) notFound()

    return data
  } catch (error) {
    notFound()
  }
}

function generateBreadcrumbsRecursive(product: IProductPage): IBreadcrumb[] {
  const breadcrumbs: IBreadcrumb[] = [{ title: 'Home', slug: '/' }]

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

/* -------------------------------------------------------------------------- */
/*                          Schema helpers (SEO)                               */
/* -------------------------------------------------------------------------- */

function getSchemaAvailability(
  status: ProductStatus,
  inventory: number
): ItemAvailability {
  if (status === 'InStock' && inventory > 0)
    return 'https://schema.org/InStock'
  if (status === 'Backorder' || status === 'IsExpected')
    return 'https://schema.org/PreOrder'
  if (status === 'OutOfStock')
    return 'https://schema.org/OutOfStock'
  if (status === 'Discontinued')
    return 'https://schema.org/Discontinued'
  return 'https://schema.org/InStock'
}

function getOfferData(product: IProductPage): Offer {
  return {
    '@type': 'Offer',
    url: `${process.env.NEXT_URL}/product/${product.slug}`,
    priceCurrency: 'EUR',
    price: product.is_sale && product.sale_price
      ? product.sale_price
      : product.price,
    availability: getSchemaAvailability(
      product.status as ProductStatus,
      product.inventory
    ),
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0],
    seller: {
      '@type': 'Organization',
      name: 'Magnet Market',
    },

    shippingDetails: [mainlandShipping, islandsShipping, remoteShipping],

    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'GR',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    },
  }
}

/* -------------------------------------------------------------------------- */
/*                                Page                                        */
/* -------------------------------------------------------------------------- */

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  if (!isValidProductSlug(params.slug)) notFound()

  const data = await getProductData(params.slug)
  const product = data.product

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

  return (
    <>
      <div className="min-h-screen">
        <SiteFeatures />
        <Breadcrumb breadcrumbs={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-9">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800">
                {images.length > 0 ? (
                  <ProductImageWidget images={images} />
                ) : (
                  <div className="flex h-96 items-center justify-center">
                    <FaRegImage className="h-40 w-40" />
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 p-6">
                <ProductBasicFeatures product={product} />
              </div>
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl">
              <ProductInfo
                description={product.description}
                chars={product.prod_chars}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <SimilarProducts
              similarProducts={data.similarProducts}
              crossCategories={product.category.cross_categories}
            />
          </div>
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

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {

  if (!isValidProductSlug(params.slug)) {
    return {
      title: 'Product not found',
      description: 'Product not found',
    };
  }

  const data = await getProductData(params.slug);
  const product = data.product;

  /* ----------------------------- Images ----------------------------- */
  const images: string[] = [];
  if (product.image) {
    images.push(`${process.env.NEXT_PUBLIC_API_URL}${product.image.url}`);
  }
  if (product.additionalImages) {
    product.additionalImages.forEach(img =>
      images.push(`${process.env.NEXT_PUBLIC_API_URL}${img.url}`)
    );
  }

  /* --------------------------- Breadcrumbs --------------------------- */
  const breadcrumbs = generateBreadcrumbsRecursive(product);

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

  /* ------------------------------ Brand ------------------------------ */
  const brandNode: Brand | undefined = product.brand
    ? {
      '@type': 'Brand',
      '@id': `${process.env.NEXT_URL}/#brand-${product.brand.slug}`,
      name: product.brand.name,
      logo: product.brand.logo
        ? `${process.env.NEXT_PUBLIC_API_URL}${product.brand.logo.url}`
        : undefined,
    }
    : undefined;

  /* ------------------------------ Product ---------------------------- */
  const productNode: Product = {
    '@type': 'Product',
    '@id': `${process.env.NEXT_URL}/product/${product.slug}`,
    name: product.name,
    description: product.description
      ?.replace(/<[^>]*>/g, '')
      .substring(0, 300),
    sku: product.id.toString(),
    mpn: product.mpn,
    gtin13: product.barcode,
    image: images,
    category: product.category?.name,

    // ✅ ΠΕΡΝΑΣ ΟΛΟ ΤΟ OBJECT
    brand: brandNode,

    offers: {
      ...getOfferData(product),
    },
  };

  /* ------------------------------ @graph ----------------------------- */
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationStructuredData,
      storeStructuredData,
      productNode,
      breadcrumbNode,
    ],
  };

  /* ------------------------------ Metadata --------------------------- */
  return {
    title: `Magnet Market – ${product.name}`,
    description:
      product.short_description
        ?.replace(/<[^>]*>/g, '')
        .substring(0, 160) ??
      product.name,
    alternates: {
      canonical: `${process.env.NEXT_URL}/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.short_description ?? product.name,
      url: `${process.env.NEXT_URL}/product/${product.slug}`,
      siteName: 'magnetmarket.gr',
      images,
      type: 'website',
    },
    other: {
      'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
    },
  };
}

export function generateStaticParams() {
  return []
}
