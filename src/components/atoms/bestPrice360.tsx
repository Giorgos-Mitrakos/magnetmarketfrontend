'use client'
import Script from "next/script";
import { useEffect } from "react";

const BestPriceScript = () => {
    return (
        <>
            <Script
                id="bestprice-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function (a, b, c, d, s) {
              a.__bp360 = c;
              a[c] = a[c] || function () {
                (a[c].q = a[c].q || []).push(arguments);
              };
              s = b.createElement('script');
              s.async = true;
              s.src = '//360.bestprice.gr/360.js';
              s.charset = 'utf-8';
              (b.body || b.head).appendChild(s);
            })(window, document, 'bp');
            window.bp && window.bp('connect', '${process.env.BESTPRICE_360_KEY}');
          `,
                }}
            />
        </>)
};

export default BestPriceScript