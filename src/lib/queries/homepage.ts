import { contentCache } from '../helpers/contentCache'
import { IProductCard } from "../interfaces/product";

/**
 * Αρχική σελίδα από το backend v3 (GET /api/homepage).
 * Το backend επιστρέφει ΜΟΝΟ τα ενεργά blocks (Ενεργό + Από/Έως) και τις
 * λίστες προϊόντων ήδη γεμάτες — εδώ απλά τα ζωγραφίζουμε.
 *
 * Ανανέωση: tag 'homepage' (άμεσα με webhook του Strapi → /api/revalidate)
 * και κάθε 5′ ως δίχτυ ασφαλείας (για blocks με «Από/Έως»).
 */
export async function getHomepageData(): Promise<IHomepage> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: contentCache(300, ['homepage']),
    })
    if (!response.ok) {
      console.error('Homepage API error:', response.status, response.statusText)
      return { body: [], seo: null, updatedAt: null }
    }
    return (await response.json()) as IHomepage
  } catch (error) {
    console.error('Homepage API error:', error)
    return { body: [], seo: null, updatedAt: null }
  }
}

/* ==================== Τύποι ==================== */

export interface IMedia {
  id: number
  name: string | null
  url: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: Record<string, { url: string; width: number; height: number }> | null
}

export interface ISeoData {
  metaTitle: string | null
  metaDescription: string | null
  metaImage: IMedia | null
  keywords: string | null
  metaRobots: string | null
  canonicalURL: string | null
  structuredData: unknown
}

export interface IHomepage {
  body: IBlock[]
  seo: ISeoData | null
  updatedAt: string | null
}

interface IBlockBase {
  id: number
  __component: string
}

export interface IHeroSlide {
  id: number
  image: IMedia
  mobile_image: IMedia | null
  href: string | null
  open_in_new_tab: boolean
  title: string | null
  text_body: string | null
  link_label: string | null
  background_color: string | null
}

export interface IHeroCarouselBlock extends IBlockBase {
  __component: 'blocks.hero-carousel'
  layout: 'full' | 'split'
  autoplay_seconds: number
  slides: IHeroSlide[]
}

export interface IBannerItem {
  id: number
  image: IMedia
  mobile_image: IMedia | null
  href: string | null
  open_in_new_tab: boolean
  title: string | null
}

export interface IBannerRowBlock extends IBlockBase {
  __component: 'blocks.banner-row'
  banners: IBannerItem[]
}

export type TProductListColor = 'purple' | 'magenta' | 'blue' | 'orange' | 'red' | 'navy'

export interface IProductListBlock extends IBlockBase {
  __component: 'blocks.product-list'
  title: string
  subtitle: string | null
  source: string
  /** «Προσφορές που λήγουν»: η πιο κοντινή λήξη (αντίστροφη μέτρηση στην κεφαλίδα) */
  ends_at?: string | null
  style: 'gradient' | 'header'
  color: TProductListColor
  products: IProductCard[]
}

export interface IHomeCategory {
  id: number
  name: string
  slug: string
  link: string
  image: IMedia | null
}

export interface ICategoriesRowBlock extends IBlockBase {
  __component: 'blocks.categories-row'
  title: string
  categories: IHomeCategory[]
}

export interface IHomeBrand {
  id: number
  name: string
  slug: string
  logo: IMedia
}

export interface IBrandsRowBlock extends IBlockBase {
  __component: 'blocks.brands-row'
  title: string
  show_all_link: boolean
  brands: IHomeBrand[]
}

export interface ISiteFeatureItem {
  id: number
  icon: string
  title: string
  text: string
}

export interface ISiteFeaturesBlock extends IBlockBase {
  __component: 'blocks.site-features'
  items: ISiteFeatureItem[]
}

export interface IRichTextBlock extends IBlockBase {
  __component: 'blocks.rich-text'
  title: string | null
  body: string
}

/* ---------- (2026-10-17) Νέα blocks ---------- */

export type TBlockColor = TProductListColor | 'black'

/** Καμπάνια με αντίστροφη μέτρηση (π.χ. Black Friday) */
export interface ICampaignCountdownBlock extends IBlockBase {
  __component: 'blocks.campaign-countdown'
  /** Αν η καμπάνια δεν έχει ξεκινήσει: μετράμε μέχρι εδώ (με τα κείμενα *_before) */
  starts_at: string | null
  ends_at: string
  title: string
  subtitle: string | null
  title_before: string
  subtitle_before: string | null
  image: IMedia | null
  mobile_image: IMedia | null
  href: string | null
  open_in_new_tab: boolean
  link_label: string | null
  color: TBlockColor
}

/** Προσφορά της ημέρας */
export interface IDealOfDayBlock extends IBlockBase {
  __component: 'blocks.deal-of-day'
  title: string
  color: TBlockColor
  discount_percent: number
  /** Πραγματικά τεμάχια αποθήκης όταν είναι λίγα, αλλιώς null */
  low_stock: number | null
  product: IProductCard
}

export interface IProductTab {
  id: number
  label: string
  source: string
  ends_at: string | null
  products: IProductCard[]
}

/** Λίστα προϊόντων με καρτέλες */
export interface IProductTabsBlock extends IBlockBase {
  __component: 'blocks.product-tabs'
  title: string | null
  subtitle: string | null
  color: TBlockColor
  tabs: IProductTab[]
}

/** Προτάσεις για εσάς (τα προϊόντα φορτώνει ο browser) */
export interface IForYouBlock extends IBlockBase {
  __component: 'blocks.for-you'
  title: string
  subtitle: string | null
  limit: number
}

export type TSolutionIcon =
  | 'home' | 'security' | 'camera' | 'lighting' | 'energy' | 'climate' | 'voice' | 'sensor'
  | 'plug' | 'wifi' | 'water' | 'door' | 'robot' | 'garden' | 'pet' | 'baby'

export type TSolutionColor = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'teal' | 'navy' | 'pink'

export interface ISolutionItem {
  id: number
  title: string
  text: string | null
  icon: TSolutionIcon
  image: IMedia | null
  href: string
  color: TSolutionColor
}

/** Λύσεις (smart home) */
export interface ISolutionsBlock extends IBlockBase {
  __component: 'blocks.solutions'
  title: string
  subtitle: string | null
  items: ISolutionItem[]
}

/** Κουπόνι (όλα τα κείμενα έρχονται έτοιμα από το backend) */
export interface ICouponBannerBlock extends IBlockBase {
  __component: 'blocks.coupon-banner'
  code: string
  /** π.χ. «-10%», «-5 €», «Δωρεάν μεταφορικά» */
  discount: string
  title: string
  text: string | null
  conditions: string[]
  ends_at: string | null
  href: string | null
  open_in_new_tab: boolean
  link_label: string | null
  color: TBlockColor
}

/** Βίντεο YouTube (φορτώνει μόνο με το play) */
export interface IVideoBlock extends IBlockBase {
  __component: 'blocks.video'
  youtube_id: string
  title: string | null
  text: string | null
  poster: IMedia | null
  layout: 'full' | 'video_left' | 'video_right'
  href: string | null
  open_in_new_tab: boolean
  link_label: string | null
}

export type IBlock =
  | IHeroCarouselBlock
  | IBannerRowBlock
  | IProductListBlock
  | ICategoriesRowBlock
  | IBrandsRowBlock
  | ISiteFeaturesBlock
  | IRichTextBlock
  | ICampaignCountdownBlock
  | IDealOfDayBlock
  | IProductTabsBlock
  | IForYouBlock
  | ISolutionsBlock
  | ICouponBannerBlock
  | IVideoBlock

/* ==================== Παλιοί τύποι (v2) ====================
 * Τους χρησιμοποιούν μόνο τα singleBanner / doubleBanner / tripleBanner /
 * hotOrSale, που δεν καλούνται πια (αντικαταστάθηκαν από bannerRow και
 * productListBlock). Όταν σβηστούν αυτά τα αρχεία, σβήνονται και οι τύποι.
 */
type TBanner = { height: number; width: number; alternativeText: string; url: string }
/** @deprecated */
export interface IHomeSingleBanner { id: number; href: string; target: string; singleBanner: TBanner }
/** @deprecated */
export interface IHomeDoubleBanner {
  id: number; rightHref: string; rightTarget: string; leftHref: string; leftTarget: string
  rightBanner: TBanner; leftBanner: TBanner
}
/** @deprecated */
export interface IHomeTripleBanner {
  id: number; rightTripleHref: string; rightTripleTarget: string; middleTripleHref: string
  middleTripleTarget: string; leftTripleHref: string; leftTripleTarget: string
  rightTripleBanner: TBanner; middleTripleBanner: TBanner; leftTripleBanner: TBanner
}
/** @deprecated */
export interface IHomeHotOrSale { id: string; title: string; type: string }
