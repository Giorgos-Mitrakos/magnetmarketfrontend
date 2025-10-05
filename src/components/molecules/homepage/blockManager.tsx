// Dynamic imports χωρίς custom loading (τα components θα έχουν εσωτερικά τα skeletons τους)
import HeroBanners from'@/components/organisms/heroBanners'
import SingleBanner from './singleBanner'
import DoubleBanner from './doubleBanner'
import TripleBanner from './tripleBanner'
import HotOrSale from './hotOrSale'
import BrandsBanner from './brandsBanner'
import ListProductsBanner from './listProductsBanner'
import CategoriesBanner from './categoriesBanner'
import SiteFeatures from '@/components/organisms/siteFeatures'

const getBlockComponent = ({ __component, ...rest }: { __component: string }, index: string) => {
    let Block: any;

    switch (__component) {
        case 'homepage.banner-list-products':
            Block = ListProductsBanner;
            break;
        case 'homepage.single-banner':
            Block = SingleBanner;
            break;
        case 'homepage.double-banner':
            Block = DoubleBanner;
            break;
        case 'homepage.triple-banner':
            Block = TripleBanner;
            break;
        case 'homepage.hot-or-sale':
            Block = HotOrSale;
            break;
        case 'homepage.categories-banner':
            Block = CategoriesBanner;
            break;
        case 'homepage.brands-banner':
            Block = BrandsBanner;
            break;
        case 'global.site-features':
            Block = SiteFeatures;
            break;
        case 'global.carousel':
            Block = HeroBanners;
            break;
        default:
            return null;
    }

    return Block ? <Block key={`index-${index}`} id={`index-${index}`} {...rest} /> : null;
};

const BlockManager = ({ blocks }: any) => {
    return (
        <div className="space-y-4 md:space-y-16 w-full">
            {blocks.map((block: any, index: number) =>
                getBlockComponent(block, index.toString())
            )}
        </div>
    );
};

BlockManager.defaultProps = {
    blocks: [],
};

export default BlockManager;