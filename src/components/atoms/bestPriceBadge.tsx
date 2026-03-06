import Script from "next/script";

const BestPriceBadge = () => {
    return (
        <>
            <Script 
                src="https://scripts.bestprice.gr/badge.js" 
                data-float="right" 
                strategy="lazyOnload" // ✅ 
            />
            <noscript>
                <a href="https://www.bestprice.gr">BestPrice.gr</a>
            </noscript>
        </>
    );
}
export default BestPriceBadge