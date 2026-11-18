// Ζωγραφίζει τα blocks της αρχικής / των σελίδων με τη σειρά που ορίστηκαν στο admin.
// Το backend στέλνει μόνο όσα είναι ενεργά τώρα — εδώ δεν γίνεται κανένα φιλτράρισμα.
import HeroBanners from '@/components/organisms/heroBanners'
import BannerRow from './bannerRow'
import ProductListBlock from './productListBlock'
import BrandsBanner from './brandsBanner'
import CategoriesBanner from './categoriesBanner'
import RichTextBlock from './richTextBlock'
import SiteFeatures from '@/components/organisms/siteFeatures'
import CampaignCountdown from './CampaignCountdown'
import DealOfDay from './DealOfDay'
import ProductTabs from './ProductTabs'
import ForYou from './ForYou'
import Solutions from './Solutions'
import CouponBanner from './CouponBanner'
import VideoBlock from './VideoBlock'
import { IBlock } from '@/lib/queries/homepage'

// (2026-10-28) Blocks με μεγάλη εικόνα. Το ΠΡΩΤΟ από αυτά στη σελίδα φορτώνει αμέσως
// (είναι συνήθως το μεγαλύτερο στοιχείο της οθόνης — LCP), ακόμη κι αν δεν είναι το
// πρώτο block (π.χ. πριν από αυτό υπάρχουν «πλεονεκτήματα» ή κείμενο).
const IMAGE_BLOCKS = new Set(['blocks.hero-carousel', 'blocks.banner-row', 'blocks.campaign-countdown'])

const renderBlock = (block: IBlock, index: number, firstImageBlock: number) => {
    const key = `${block.__component}-${block.id}-${index}`
    const id = `block-${index}`

    switch (block.__component) {
        case 'blocks.hero-carousel':
            return (
                <HeroBanners
                    key={key}
                    slides={block.slides}
                    layout={block.layout}
                    autoplaySeconds={block.autoplay_seconds}
                    priority={index === firstImageBlock}
                />
            )
        case 'blocks.banner-row':
            return <BannerRow key={key} id={id} banners={block.banners} priority={index === firstImageBlock} />
        case 'blocks.product-list':
            return <ProductListBlock key={key} {...block} id={id} />
        case 'blocks.categories-row':
            return <CategoriesBanner key={key} id={id} title={block.title} categories={block.categories} />
        case 'blocks.brands-row':
            return (
                <BrandsBanner
                    key={key}
                    id={id}
                    title={block.title}
                    showAllLink={block.show_all_link}
                    brands={block.brands}
                />
            )
        case 'blocks.site-features':
            return <SiteFeatures key={key} items={block.items} />
        case 'blocks.rich-text':
            return <RichTextBlock key={key} id={id} title={block.title} body={block.body} />
        // (2026-10-17) Νέα blocks
        case 'blocks.campaign-countdown':
            return <CampaignCountdown key={key} id={id} block={block} priority={index === firstImageBlock} />
        case 'blocks.deal-of-day':
            return <DealOfDay key={key} id={id} block={block} />
        case 'blocks.product-tabs':
            return <ProductTabs key={key} id={id} block={block} />
        case 'blocks.for-you':
            return <ForYou key={key} id={id} title={block.title} subtitle={block.subtitle} limit={block.limit} />
        case 'blocks.solutions':
            return <Solutions key={key} id={id} block={block} />
        case 'blocks.coupon-banner':
            return <CouponBanner key={key} id={id} block={block} />
        case 'blocks.video':
            return <VideoBlock key={key} id={id} block={block} />
        default:
            return null
    }
}

const BlockManager = ({ blocks = [] }: { blocks?: IBlock[] }) => {
    return (
        <div className="space-y-4 md:space-y-16 w-full">
            {(() => {
                const firstImageBlock = blocks.findIndex((b) => IMAGE_BLOCKS.has(b.__component))
                return blocks.map((block, index) => renderBlock(block, index, firstImageBlock))
            })()}
        </div>
    )
}

export default BlockManager
