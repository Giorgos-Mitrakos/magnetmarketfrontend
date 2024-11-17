import dynamic from "next/dynamic";
import Breadcrumb from '@/components/molecules/breadcrumb';
import Newsletter from '@/components/molecules/newsletter';
// import ProductImageWidget from '@/components/molecules/productImageWidget';
import ProductBasicFeatures from '@/components/organisms/productBasicFeatures';
import SiteFeatures from '@/components/organisms/siteFeatures';
import SuggestedProducts from '@/components/organisms/suggestedProducts';
import { GET_PRODUCT_BY_SLUG, IProductProps } from '@/lib/queries/productQuery';
import { getStrapiMedia } from '@/repositories/medias';
import { requestSSR } from '@/repositories/repository';
import Image from 'next/image'
const ProductInfo = dynamic(() => import("@/components/organisms/productInfo"), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

const ProductImageWidget = dynamic(() => import('@/components/molecules/productImageWidget'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})



async function getProductData(slug: string) {
  const data = await requestSSR({
    query: GET_PRODUCT_BY_SLUG, variables: { slug: slug }
  });

  return data as IProductProps
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
  images.push(data.products.data[0]?.attributes.image.data)
  data.products.data[0]?.attributes.additionalImages.data.forEach(x => {
    images.push(x)
  })

  return (
    <div className="dark:bg-gray-800">
      <SiteFeatures />
      <Breadcrumb breadcrumbs={breadcrumbs} />
      {data.products.data.length > 0 &&
        < div className="grid md:grid-cols-4 lg:grid-cols-5 w-full mt-8">
          <div className='col-span-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 col-span-4'>
              <div>
                <ProductImageWidget images={images} />
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
  )
}
