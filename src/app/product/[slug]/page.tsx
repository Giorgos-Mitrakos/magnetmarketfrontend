import dynamic from "next/dynamic";
import Breadcrumb from '@/components/molecules/breadcrumb';
import { Metadata, ResolvingMetadata } from 'next'
import Newsletter from '@/components/molecules/newsletter';
import ProductBasicFeatures from '@/components/organisms/productBasicFeatures';
import SiteFeatures from '@/components/organisms/siteFeatures';
import SuggestedProducts from '@/components/organisms/suggestedProducts';
import { GET_PRODUCT_BY_SLUG } from '@/lib/queries/productQuery';
import { requestSSR } from '@/repositories/repository';
import { FaRegImage } from "react-icons/fa";
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { IProducts } from "@/lib/interfaces/product";
const ProductInfo = dynamic(() => import("@/components/organisms/productInfo"), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

const ProductImageWidget = dynamic(() => import('@/components/molecules/productImageWidget'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

type MetadataProps = {
  params: { slug: string }
}



async function getProductData(slug: string) {
  const data: IProducts | any = await requestSSR({
    query: GET_PRODUCT_BY_SLUG, variables: { slug: slug }
  });

  if (data.products.data.length === 0) {
    notFound();
  }

  return data as IProducts
}

export default async function Product({ params }:
  {
    params: { slug: string }
  }) {

  const data = await getProductData(params.slug)

  const breadcrumbs = [
    {
      title: "Home",
      slug: "/"
    },
    {
      title: data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.parents.data[0].attributes.name,
      slug: `/category/${data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.parents.data[0].attributes.slug}`
    },
    {
      title: data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.name,
      slug: `/category/${data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.parents.data[0]?.attributes.slug}/${data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.slug}`
    },
    {
      title: data.products.data[0]?.attributes.category.data.attributes.name,
      slug: `/category/${data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.parents.data[0].attributes.slug}/${data.products.data[0]?.attributes.category.data.attributes.parents.data[0]?.attributes.slug}/${data.products.data[0]?.attributes.category.data.attributes.slug}`
    },
    {
      title: data.products.data[0]?.attributes.name,
      slug: `/product/${data.products.data[0]?.attributes.slug}`
    }
  ]

  const images = []
  if (data.products.data[0]?.attributes.image.data)
    images.push(data.products.data[0]?.attributes.image.data)
  data.products.data[0]?.attributes.additionalImages.data.forEach(x => {
    images.push(x)
  })

  const product = data.products.data[0]

  const structuredDataImages = images.map(x => `${process.env.NEXT_PUBLIC_API_URL}${x.attributes.url}`)

  // let structuredDataPrice = {
  //   "@type": "Offer",
  //   "url": `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
  //   "availability": "https://schema.org/InStock",
  //   "itemCondition": "https://schema.org/NewCondition",
  //   "priceCurrency": "EUR",
  //   "price": product.attributes.is_sale && product.attributes.sale_price
  //     ? product.attributes.sale_price
  //     : product.attributes.price,
  //   "priceSpecification": {
  //     "@type": "UnitPriceSpecification",
  //     "price": product.attributes.is_sale && product.attributes.sale_price
  //       ? product.attributes.sale_price
  //       : product.attributes.price,
  //     "priceCurrency": "EUR"
  //   }
  // }

  // if(product.attributes.is_sale && product.attributes.sale_price) {
  //     structuredDataPrice = {
  //       "@type": "Offer",
  //       url: `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
  //       availability: "https://schema.org/InStock",
  //       itemCondition: 'https://schema.org/NewCondition',
  //       "price": product.attributes.sale_price,
  //       "priceCurrency": "EUR",
  //       // Optional: add priceValidUntil only if known
  //       // "priceValidUntil": "2025-12-31",

  //       "priceSpecification": [
  //         {
  //           "@type": "UnitPriceSpecification",
  //           "price": product.attributes.sale_price,
  //           "priceCurrency": "EUR"
  //         },
  //         {
  //           "@type": "UnitPriceSpecification",
  //           "priceType": "https://schema.org/StrikethroughPrice",
  //           "price": product.attributes.price,
  //           "priceCurrency": "EUR"
  //         }
  //       ],
  //       "shippingDetails": {
  //         "@type": "OfferShippingDetails",
  //         "shippingRate": {
  //           "@type": "MonetaryAmount",
  //           "value": 4.5,
  //           "currency": "EUR"
  //         },
  //         "shippingDestination": {
  //           "@type": "DefinedRegion",
  //           "addressCountry": "GR"
  //         },
  //         "deliveryTime": {
  //           "@type": "ShippingDeliveryTime",
  //           "handlingTime": {
  //             "@type": "QuantitativeValue",
  //             "minValue": 0,
  //             "maxValue": 1,
  //             "unitCode": "DAY"
  //           },
  //           "transitTime": {
  //             "@type": "QuantitativeValue",
  //             "minValue": 1,
  //             "maxValue": 5,
  //             "unitCode": "DAY"
  //           }
  //         }
  //       },
  //       "hasMerchantReturnPolicy": {
  //         "@type": "MerchantReturnPolicy",
  //         "applicableCountry": "GR",
  //         "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  //         "merchantReturnDays": 14,
  //         "merchantReturnLink": `${process.env.NEXT_URL}/pages/politiki-epistrofon`,
  //         "returnMethod": "https://schema.org/ReturnByMail",
  //         "returnFees": "https://schema.org/FreeReturn"
  //       }
  //     }
  //   }
  // else {
  //   structuredDataPrice = {
  //     "@type": "Offer",
  //     url: `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
  //     availability: "https://schema.org/InStock",
  //     itemCondition: 'https://schema.org/NewCondition',
  //     "price": product.attributes.price,
  //     "priceCurrency": "EUR",

  //     "priceSpecification": [
  //       {
  //         "@type": "UnitPriceSpecification",
  //         "price": product.attributes.price,
  //         "priceCurrency": "EUR"
  //       }
  //     ],
  //     "shippingDetails": {
  //       "@type": "OfferShippingDetails",
  //       "shippingRate": {
  //         "@type": "MonetaryAmount",
  //         "value": 4.5,
  //         "currency": "EUR"
  //       },
  //       "shippingDestination": {
  //         "@type": "DefinedRegion",
  //         "addressCountry": "GR"
  //       },
  //       "deliveryTime": {
  //         "@type": "ShippingDeliveryTime",
  //         "handlingTime": {
  //           "@type": "QuantitativeValue",
  //           "minValue": 0,
  //           "maxValue": 1,
  //           "unitCode": "DAY"
  //         },
  //         "transitTime": {
  //           "@type": "QuantitativeValue",
  //           "minValue": 1,
  //           "maxValue": 5,
  //           "unitCode": "DAY"
  //         }
  //       }
  //     },
  //     "hasMerchantReturnPolicy": {
  //       "@type": "MerchantReturnPolicy",
  //       "applicableCountry": "GR",
  //       "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  //       "merchantReturnDays": 14,
  //       "merchantReturnLink": `${process.env.NEXT_URL}/pages/politiki-epistrofon`,
  //       "returnMethod": "https://schema.org/ReturnByMail",
  //       "returnFees": "https://schema.org/FreeReturn"
  //     }
  //   }
  // }

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
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="dark:bg-gray-800">
        <SiteFeatures />
        <Breadcrumb breadcrumbs={breadcrumbs} />
        {data.products.data.length > 0 &&
          < div className="grid md:grid-cols-4 lg:grid-cols-5 w-full mt-8">
            <div className='col-span-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 col-span-4'>
                <div>
                  {images.length > 0 ?
                    <ProductImageWidget images={images} /> :
                    <div className="flex justify-center text-siteColors-purple">
                      <FaRegImage className='h-60 w-60' />
                    </div>}
                </div>
                <div>
                  <ProductBasicFeatures product={data.products.data[0]} />
                </div>
              </div>
              <div className='mt-16 lg:mr-4'>
                <ProductInfo description={data.products.data[0].attributes.description} chars={data.products.data[0].attributes.prod_chars} />
              </div>
            </div>
            <aside className='col-span-4 lg:col-start-5'>
              <SuggestedProducts product={data.products.data[0]} />
            </aside>
          </div>}
        <div className='mt-20'>
          <Newsletter />
        </div>
      </div >
    </>
  )
}


export async function generateMetadata({ params }: MetadataProps,
  parent: ResolvingMetadata): Promise<Metadata> {

  const data = await getProductData(params.slug)

  const product = data.products.data[0]

  let metadata: Metadata = {
    title: `Magnet Market-${product.attributes.name.length > 53 ? product.attributes.name.slice(0, 53) : product.attributes.name}`,
    category: `${product.attributes.category.data.attributes.name}`,
    alternates: {
      canonical: `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
    }

  }

  if (product.attributes.short_description) {
    metadata.description = `${product.attributes.short_description
      .replaceAll("<p>", "")
      .replaceAll("</p>", "")
      .replaceAll("&nbsp;", " ")
      .replaceAll("\n", "")
      }`
  }
  else if (product.attributes.brand.data) {
    metadata.description = `To ${product.attributes.name} είναι ένα προϊόν της εταιρίας ${product.attributes.brand.data.attributes.name}`
  }

  if (product.attributes.image.data) {
    metadata.openGraph = {
      url: `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
      type: 'website',
      images: [`${process.env.NEXT_PUBLIC_API_URL}${product.attributes.image.data?.attributes.url}`],
      siteName: "magnetmarket.gr",
      phoneNumbers: ["2221121657"],
      emails: ["info@magnetmarket.gr"],
      countryName: 'Ελλάδα',
    }
  }

  return metadata
}
