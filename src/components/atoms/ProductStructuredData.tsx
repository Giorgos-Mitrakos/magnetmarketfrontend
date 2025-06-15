import React from 'react';
import Script from 'next/script';
import { IProducts } from '@/lib/interfaces/product';
import { requestSSR } from '@/repositories/repository';
import { GET_PRODUCT_BY_SLUG } from '@/lib/queries/productQuery';
import { notFound } from 'next/navigation';

type Props = {
  structuredData: any;
};

async function getProductData(slug: string) {
  const data: IProducts | any = await requestSSR({
    query: GET_PRODUCT_BY_SLUG, variables: { slug: slug }
  });

  if (data.products.data.length === 0) {
    notFound();
  }

  return data as IProducts
}

const ProductStructuredData = async ({ slug, breadcrumbs }: { slug: string, breadcrumbs: { title: string, slug: string }[] }) => {

  const data = await getProductData(slug)

  const images = []
  if (data.products.data[0]?.attributes.image.data)
    images.push(data.products.data[0]?.attributes.image.data)
  data.products.data[0]?.attributes.additionalImages.data.forEach(x => {
    images.push(x)
  })

  const product = data.products.data[0]

  const structuredDataImages = images.map(x => `${process.env.NEXT_PUBLIC_API_URL}${x.attributes.url}`)

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.attributes.name,
    description: product.attributes.description,
    sku: product.id,
    mpn: product.attributes.mpn,
    gtin13: product.attributes.barcode,
    brand: product.attributes.brand.data ?
      {
        '@type': 'Brand',
        name: product.attributes.brand.data.attributes.name,
        logo: product.attributes.brand.data.attributes.logo && product.attributes.brand.data.attributes.logo.data ?
          `${process.env.NEXT_PUBLIC_API_URL}${product.attributes.brand.data.attributes.logo.data.attributes.url}`
          : ''
      } :
      {}
    ,
    image: structuredDataImages,
    keywords: `${product.attributes.category.data.attributes.name}`,
    offers: {
      "@type": "Offer",
      "url": `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "price": product.attributes.is_sale && product.attributes.sale_price
        ? product.attributes.sale_price
        : product.attributes.price,
      "priceCurrency": "EUR",
      "seller": {
        "@type": "Organization",
        "name": "Magnet Market"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 4.5,
          "currency": "EUR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "GR"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "GR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "merchantReturnLink": `${process.env.NEXT_URL}/pages/politiki-epistrofon`,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
  };

  const breadcrumbList = breadcrumbs.map((breabcrumb, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": breabcrumb.title,
    "item": `${process.env.NEXT_URL}${breabcrumb.slug}`
  }))

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbList
  }

  const structuredData = []
  structuredData.push(productStructuredData)
  structuredData.push(breadcrumbStructuredData)

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default ProductStructuredData;