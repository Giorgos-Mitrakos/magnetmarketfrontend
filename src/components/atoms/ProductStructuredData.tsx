import React from 'react';
import Head from 'next/head';

type Props = {
  structuredData: any;
};

const ProductStructuredData = ({ structuredData }: Props) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  );
};

export default ProductStructuredData;