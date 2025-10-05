import { flattenJSON } from "../helpers/helpers";
import { IImageAttr, IImageFormats } from "../interfaces/image";

export async function getHomepageData() {
  const myHeaders = new Headers();

  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage`,
    {
      method: "GET",
      headers: myHeaders,
      next: {
        revalidate: 10, // Χρήση της μεταβλητής cacheTime
      }
    }
  )

  const data = await response.json()

  const flattenedData = flattenJSON(data);
  
  return flattenedData
}

type TBanner = {
  height: number,
  width: number,
  alternativeText: string,
  url: string
}

export interface IHomeSingleBanner {
  id: number
  href: string
  target: string
  singleBanner: TBanner
}

export interface IHomeDoubleBanner {
  id: number
  rightHref: string
  rightTarget: string
  leftHref: string
  leftTarget: string
  rightBanner: TBanner
  leftBanner: TBanner
}
export interface IHomeTripleBanner {
  id: number
  rightTripleHref: string
  rightTripleTarget: string
  middleTripleHref: string
  middleTripleTarget: string
  leftTripleHref: string
  leftTripleTarget: string
  rightTripleBanner: TBanner
  middleTripleBanner: TBanner
  leftTripleBanner: TBanner
}

export interface IHomeCategoriesBanner {
  id: string,
  categories: {
    id: string
    name: string
    slug: string
    link: string
    parents: {
      slug: string
      parents: {
        slug: string
      }[]
    }[]
    image: IImageAttr
  }[]
}

export interface IHomeBrandsBanner {
  id: string,
  name: string,
  slug: string,
  logo: {
    name: string
    alternativeText: string
    url: string
    formats: IImageFormats
  }
}

export interface IHomeHotOrSale {
  id: string
  title: string
  type: string
}

export interface IHeroCarouselBanner {
  id: string,
  link_label: string,
  href: string,
  target: string,
  title: string,
  text_body: string,
  backgroundColor: string,
  caption: string
  cta: string
  image: {
    name: string
    alternativeText: string
    url: string
    width: number
    height: number

    formats: IImageFormats
  }
}