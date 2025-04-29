'use client';

import Script from 'next/script';

const BestPriceProductBadge = ({ productId }: { productId: number }) => {
    return (
        <>
            <Script
                id="bestprice-product-badge"
                src="https://scripts.bestprice.gr/pbadge.js"
                async
                strategy="afterInteractive"
                data-mid={productId}
            />
            <noscript>
                <a href="https://www.bestprice.gr">BestPrice.gr</a>
            </noscript>
        </>
    );
};

export default BestPriceProductBadge;