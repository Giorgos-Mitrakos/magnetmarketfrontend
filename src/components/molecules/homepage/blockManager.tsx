import dynamic from "next/dynamic";

const BrandsBanner = dynamic(() => import("./brandsBanner"));
const CategoriesBanner = dynamic(() => import("./categoriesBanner"));
const DoubleBanner = dynamic(() => import( "./doubleBanner"));
const HotOrSale = dynamic(() => import( "./hotOrSale"));
const ListProductsBanner = dynamic(() => import( "./listProductsBanner"));
const SingleBanner = dynamic(() => import( "./singleBanner"));
const TripleBanner = dynamic(() => import( "./tripleBanner"));
const HeroBanners = dynamic(() => import( "@/components/organisms/heroBanners"));
const SiteFeatures = dynamic(() => import('@/components/organisms/siteFeatures'), { ssr: false })


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

    return Block ? <Block key={`index-${index}`} id={`index-${index}`} {...rest} /> : null;
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