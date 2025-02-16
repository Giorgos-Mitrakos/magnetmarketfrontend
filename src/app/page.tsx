
import BlockManager from '@/components/molecules/homepage/blockManager';
import ListProductsBanner from '@/components/molecules/homepage/listProductsBanner';
import Newsletter from '@/components/molecules/newsletter'
import HeroBanners from '@/components/organisms/heroBanners';
import SiteFeatures from '@/components/organisms/siteFeatures'
import { organizationStructuredData } from '@/lib/helpers/structureData';
import { GET_HOMEPAGE, IHomepageProps } from '@/lib/queries/homepage';
import { requestSSR } from '@/repositories/repository';
import { Metadata } from 'next'
import Script from 'next/script';

async function getHomepageData() {
  const data = await requestSSR({
    query: GET_HOMEPAGE, variables: {}
  });

  return data as IHomepageProps
}

export default async function Home() {

  const data = await getHomepageData()

  const breadcrumbs = [
    {
      title: "Home",
      slug: "/"
    }
  ]

  const BreadcrumbList = breadcrumbs.map((breabcrumb, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": breabcrumb.title,
    "item": `${process.env.NEXT_URL}${breabcrumb.slug}`
  }))

  const BreadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": BreadcrumbList
  }

  const structuredData = []
  structuredData.push(BreadcrumbStructuredData)
  structuredData.push(organizationStructuredData)

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full space-y-16">
        {/* <HeroBanners carousel={data.homepage.data.attributes.Carousel} fixed_hero_banners={data.homepage.data.attributes.fixed_hero_banners} /> */}
        {/* <SiteFeatures /> */}
        {/* <ListProductsBanner props={data.homepage.data.attributes.body[0]} /> */}
        <BlockManager blocks={data.homepage.data.attributes.body} />
        <Newsletter />
      </main>
    </>
  )
}

export const metadata: Metadata = {
  title: 'Magnet Μarket Η τεχνολογία στο δικό σου πεδίο!',
  description: 'Μην το ψάχνεις, εδώ θα βρείς τις καλύτερες τιμές και προσφορές σε υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις και άλλα προϊόντα.',
  keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
  alternates: {
    canonical: `${process.env.NEXT_URL}/`,
  },
  verification: { other: { "msvalidate.01": "5F57CFA85BD6BCF4DE69C7AEDF67B332" } },
  openGraph: {
    url: 'www.magnetmarket.gr',
    type: 'website',
    images: [`${process.env.NEXT_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
    siteName: "www.magnetmarket.gr",
    emails: ["info@magnetmarket.gr"],
    phoneNumbers: ['2221121657'],
    countryName: 'Ελλάδα',
  }
}
