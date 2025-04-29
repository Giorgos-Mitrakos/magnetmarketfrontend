import Script from "next/script";

const BestPriceBadge = () => {
    return (
        <div className="flex justify-center bg-[#559be3] items-center space-x-4 px-8 ">
            <Script src="https://scripts.bestprice.gr/badge.js" data-float="right" strategy="afterInteractive"></Script>
            <noscript>
                <a href="https://www.bestprice.gr">BestPrice.gr</a>
            </noscript>

        </div>
    );

}

export default BestPriceBadge