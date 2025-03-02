import dynamic from 'next/dynamic'
// import SiteFeatures from "@/components/organisms/siteFeatures";
// import BrandsBanner from "./brandsBanner";
// import DoubleBanner from "./doubleBanner";
// import HotOrSale from "./hotOrSale";
// import ListProductsBanner from "./listProductsBanner";
// import SingleBanner from "./singleBanner";
// import TripleBanner from "./tripleBanner";
// import HeroBanners from "@/components/organisms/heroBanners";
// import CategoriesBanner from "./categoriesBanner";

const HeroBanners = dynamic(() => import('@/components/organisms/heroBanners'), { loading: () => <p>Loading...</p>, })
const BrandsBanner = dynamic(() => import('./brandsBanner'), { loading: () => <p>Loading...</p>, })
const CategoriesBanner = dynamic(() => import('./categoriesBanner'), { loading: () => <p>Loading...</p>, })
const SiteFeatures = dynamic(() => import('@/components/organisms/siteFeatures'), { loading: () => <p>Loading...</p>, })
const DoubleBanner = dynamic(() => import('./doubleBanner'), { loading: () => <p>Loading...</p>, })
const HotOrSale = dynamic(() => import('./hotOrSale'), { loading: () => <p>Loading...</p>, })
const ListProductsBanner = dynamic(() => import('./listProductsBanner'), { loading: () => <p>Loading...</p>, })
const SingleBanner = dynamic(() => import('./singleBanner'), { loading: () => <p>Loading...</p>, })
const TripleBanner = dynamic(() => import('./tripleBanner'), { loading: () => <p>Loading...</p>, })


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