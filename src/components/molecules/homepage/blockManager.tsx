import DoubleBanner from "./doubleBanner";
import HotOrSale from "./hotOrSale";
import ListProductsBanner from "./listProductsBanner";
import SingleBanner from "./singleBanner";
import TripleBanner from "./tripleBanner";


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
    }

    return Block ? <Block key={`index-${index}`} id={`index-${index}`} {...rest} /> : null;
};

const BlockManager = ({ blocks }: any) => {
    return <div className="space-y-16">
        {blocks.map(getBlockComponent)}
    </div>;
};

BlockManager.defaultProps = {
    blocks: [],
};

export default BlockManager;