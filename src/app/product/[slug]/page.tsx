import Breadcrumb from '@/components/molecules/breadcrumb';
import { Metadata, ResolvingMetadata } from 'next'
import Newsletter from '@/components/molecules/newsletter';
import ProductBasicFeatures from '@/components/organisms/productBasicFeatures';
import SiteFeatures from '@/components/organisms/siteFeatures';
import { FaRegImage } from "react-icons/fa";
import { notFound } from 'next/navigation'
import { IProductPage, TProductPage } from "@/lib/interfaces/product";
import { localBusinessStructuredData, organizationStructuredData } from "@/lib/helpers/structureData";
import SimilarProducts from "@/components/organisms/similarProducts";
import ProductInfo from "@/components/organisms/productInfo"
import ProductImageWidget from '@/components/molecules/productImageWidget'

export const dynamicParams = true
export const revalidate = 86400 // 24 ώρες

type MetadataProps = {
  params: { slug: string }
}

// TypeScript interfaces
interface IBreadcrumb {
  title: string;
  slug: string;
}

interface ICategory {
  id: number;
  name: string;
  slug: string;
  parents?: ICategory[];
}

async function getProductData(slug: string) {
  try {
    
    // Βελτιωμένος έλεγχος για invalid slugs
    if (!slug ||
      slug.includes('.') || // Απορρίπτει οποιοδήποτε slug με τελείες
      slug.length < 2 || // Πολύ μικρά slugs
      slug.length > 1500 //|| // Πολύ μεγάλα slugs
      // /[^a-zA-Z0-9\-]/.test(slug) // Μη-επιτρεπτοί χαρακτήρες
    ) {
      notFound()
    }

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ slug: slug })
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/getProductBySlug`,
      myInit
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.product) {
      notFound();
    }

    return data as TProductPage;
  } catch (error) {
    console.error('Error fetching product data:', error);
    notFound();
  }
}

// Διορθωμένη υλοποίηση με TypeScript
function generateBreadcrumbsRecursive(product: IProductPage): IBreadcrumb[] {

  if (!product) {
    return [{ title: "Home", slug: "/" }];
  }

  // Recursive συνάρτηση για συλλογή της ιεραρχίας
  function collectCategoryHierarchy(category: ICategory | null, hierarchy: ICategory[] = []): ICategory[] {
    if (!category) return hierarchy;

    // Προσθήκη της τρέχουσας κατηγορίας στην αρχή
    hierarchy.unshift(category);

    // Συνέχεια με το πρώτο parent (αν υπάρχει)
    const parent = category.parents && category.parents.length > 0 ? category.parents[0] : null;
    return collectCategoryHierarchy(parent, hierarchy);
  }

  const breadcrumbs: IBreadcrumb[] = [{ title: "Home", slug: "/" }];
  const categoryHierarchy = collectCategoryHierarchy(product.category);

  // Δημιουργία breadcrumb για κάθε κατηγορία
  categoryHierarchy.forEach((category, index) => {
    const slugParts = categoryHierarchy
      .slice(0, index + 1)
      .map(cat => cat.slug);

    breadcrumbs.push({
      title: category.name,
      slug: `/category/${slugParts.join('/')}`
    });
  });

  // Προσθήκη προϊόντος
  breadcrumbs.push({
    title: product.name,
    slug: `/product/${product.slug}`
  });

  return breadcrumbs;
}

export default async function Product({ params }:
  {
    params: { slug: string }
  }) {

  // Έλεγχος των params πριν από οποιαδήποτε processing
  if (!isValidProductSlug(params.slug)) {
    notFound();
  }

  const data = await getProductData(params.slug)
  const product = data.product

  const breadcrumbs = generateBreadcrumbsRecursive(product)

  const images = []
  if (product.image)
    images.push(product.image)

  if (product.additionalImages)
    product.additionalImages.forEach(x => {
      images.push(x)
    })

  const structuredDataImages = images.map(x => `${process.env.NEXT_PUBLIC_API_URL}${x.url}`)

  const getOfferData = (product: IProductPage) => {
    const baseOffer = {
      "@type": "Offer",
      "url": `${process.env.NEXT_URL}/product/${product.slug}`,
      "availability": product.inventory > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "priceCurrency": "EUR",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      "seller": {
        "@type": "Organization",
        "name": "Magnet Market"
      }
    };

    if (product.is_sale && product.sale_price) {
      return {
        ...baseOffer,
        "price": product.sale_price,
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": product.sale_price,
          "priceCurrency": "EUR",
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "C62" // unit code for "piece"
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "GR",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      };
    } else {
      return {
        ...baseOffer,
        "price": product.price,
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": product.price,
          "priceCurrency": "EUR",
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "C62"
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "GR",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      };
    }
  };

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'productID': product.id,
    'name': product.name,
    'description': product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 300) : undefined,
    'sku': product.id,
    'mpn': product.mpn,
    'gtin13': product.barcode,
    'brand': product.brand ? {
      '@type': 'Brand',
      'name': product.brand.name,
      'logo': product.brand.logo
        ? `${process.env.NEXT_PUBLIC_API_URL}${product.brand.logo.url}`
        : undefined
    } : undefined,
    'image': structuredDataImages,
    'offers': getOfferData(product),
    'category': product.category?.name
  };

  const generateBreadcrumbStructuredData = (breadcrumbs: any[]) => {
    // Filter out any invalid breadcrumbs
    const validBreadcrumbs = breadcrumbs.filter(breadcrumb =>
      breadcrumb && breadcrumb.title && breadcrumb.slug
    );

    if (validBreadcrumbs.length === 0) {
      return null; // Don't generate structured data if no valid breadcrumbs
    }

    const itemListElement = validBreadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.title,
      "item": `${process.env.NEXT_URL}${breadcrumb.slug}`
    }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };
  };

  // Usage:
  const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);

  const structuredData = []
  structuredData.push(productStructuredData)
  if (breadcrumbData) {
    structuredData.push(breadcrumbData);
  }

  structuredData.push(organizationStructuredData)
  structuredData.push(localBusinessStructuredData)

  return (
    <>
      <script
        id="structured-data"
        key="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="min-h-screen">
        <SiteFeatures />
        {/* Breadcrumb */}
        <Breadcrumb breadcrumbs={breadcrumbs} />
        {/* Στο product page component */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content (9 columns) */}
          <div className="lg:col-span-9">
            {/* Product Images and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Product Images */}
              <div className="bg-white dark:bg-gray-800  overflow-hidden">
                {images.length > 0 ?
                  <ProductImageWidget images={images} /> :
                  <div className="flex justify-center items-center h-96 text-siteColors-purple dark:text-gray-400">
                    <FaRegImage className='h-40 w-40' />
                  </div>}
              </div>

              {/* Product Basic Features */}
              <div className="bg-white dark:bg-gray-800 p-6">
                <ProductBasicFeatures product={product} />
              </div>
            </div>

            {/* Product Info */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <ProductInfo description={product.description} chars={product.prod_chars} />
            </div>
          </div>

          {/* Right Column - Suggested Products (3 columns) */}
          <div className="lg:col-span-3">
            <SimilarProducts similarProducts={data.similarProducts} crossCategories={data.product.category.cross_categories}/>
          </div>
        </div>

        {/* Newsletter at bottom */}
        <div className='mt-12'>
          <Newsletter />
        </div>
      </div>
    </>
  )
}

// Προσθήκη αυτής της συνάρτησης για έλεγχο των params
export function generateStaticParams() {
  return [] // Δεν προ-rendering καθώς έχουμε dynamic params
}

// Validation function
function isValidProductSlug(slug: string): boolean {
  return (
    typeof slug === 'string' &&
    slug.length >= 2 &&
    slug.length <= 5000 &&
    !slug.includes('.') && // Απορρίπτει files
    !slug.includes('..')
  )
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  // Έλεγχος και εδώ
  if (!isValidProductSlug(params.slug)) {
    return {
      title: 'Product Not Found',
      description: 'Product not found'
    }
  }

  try {
    const data = await getProductData(params.slug)
    const product = data.product

    let metadata: Metadata = {
      title: `Magnet Market - ${product.name.length > 53 ? product.name.slice(0, 53) + '...' : product.name}`,
      category: product.category.name,
      alternates: {
        canonical: `${process.env.NEXT_URL}/product/${product.slug}`,
      }
    }

    if (product.short_description) {
      metadata.description = product.short_description
        .replaceAll("<p>", "")
        .replaceAll("</p>", "")
        .replaceAll("&nbsp;", " ")
        .replaceAll("\n", "")
        .substring(0, 160); // Περιορισμός length για SEO
    } else if (product.brand) {
      metadata.description = `Το ${product.name} είναι ένα προϊόν της εταιρίας ${product.brand.name}`
    }

    if (product.image) {
      metadata.openGraph = {
        title: metadata.title as string,
        description: metadata.description ? metadata.description : '',
        url: `${process.env.NEXT_URL}/product/${product.slug}`,
        type: 'website',
        images: [`${process.env.NEXT_PUBLIC_API_URL}${product.image.url}`],
        siteName: "magnetmarket.gr",
      }
    }

    return metadata
  } catch (error) {
    return {
      title: 'Product Not Found',
      description: 'Product not found'
    }
  }
}