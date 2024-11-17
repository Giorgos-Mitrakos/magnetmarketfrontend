
import BlockManager from '@/components/molecules/homepage/blockManager';
import ListProductsBanner from '@/components/molecules/homepage/listProductsBanner';
import Newsletter from '@/components/molecules/newsletter'
import HeroBanners from '@/components/organisms/heroBanners';
import SiteFeatures from '@/components/organisms/siteFeatures'
import { GET_HOMEPAGE, IHomepageProps } from '@/lib/queries/homepage';
import { requestSSR } from '@/repositories/repository';

async function getHomepageData() {
  const data = await requestSSR({
    query: GET_HOMEPAGE, variables: {}
  });

  return data as IHomepageProps
}

export default async function Home() {

  const data = await getHomepageData()

  return (
    <main className="w-full grid space-y-16">
      <HeroBanners carousel={data.homepage.data.attributes.Carousel} fixed_hero_banners={data.homepage.data.attributes.fixed_hero_banners} />
      <SiteFeatures/>
      {/* <ListProductsBanner props={data.homepage.data.attributes.body[0]} /> */}
      <BlockManager blocks={data.homepage.data.attributes.body} />
      <Newsletter />
    </main>
  )
}
