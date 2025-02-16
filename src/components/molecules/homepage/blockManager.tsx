import SiteFeatures from "@/components/organisms/siteFeatures";
import BrandsBanner from "./brandsBanner";
import CategoriesBanner from "./categoriesBanner";
import DoubleBanner from "./doubleBanner";
import HotOrSale from "./hotOrSale";
import ListProductsBanner from "./listProductsBanner";
import SingleBanner from "./singleBanner";
import TripleBanner from "./tripleBanner";
import HeroBanners from "@/components/organisms/heroBanners";


const getBlockComponent = ({ __typename, ...rest }: { __typename: string }, index: string) => {
    let Block: any;

    switch (__typename) {
        case 'ComponentHomepageBannerListProducts':
            Block = ListProductsBanner;
            break;
        case 'ComponentHomepageSingleBanner':
            Block = SingleBanner;
            break;
        case 'ComponentHomepageDoubleBanner':
            Block = DoubleBanner;
            break;
        case 'ComponentHomepageTripleBanner':
            Block = TripleBanner;
            break;
        case 'ComponentHomepageHotOrSale':
            Block = HotOrSale;
            break;
        case 'ComponentHomepageCategoriesBanner':
            Block = CategoriesBanner;
            break;
        case 'ComponentHomepageBrandsBanner':
            Block = BrandsBanner;
            break;
        case 'ComponentGlobalSiteFeatures':
            Block = SiteFeatures;
            break;
        case 'ComponentGlobalCarousel':
            Block = HeroBanners;
            break;
    }

    return Block ? <Block tabIndex={index + 1} key={`index-${index}`} id={`index-${index}`} {...rest} /> : null;
};

const BlockManager = ({ blocks }: any) => {
    return <div className="space-y-16 w-full">
        {blocks.map(getBlockComponent)}
    </div>;
};

BlockManager.defaultProps = {
    blocks: [],
};

export default BlockManager;