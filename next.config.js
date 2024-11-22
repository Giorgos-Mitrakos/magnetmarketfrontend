/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:1337',
    NEXT_URL: 'http://localhost:3000',
    STRAPI_TOKEN: '9802e5d2c855e6815f50ed66d6e3f5aa5eb4b2839c70b4fa19541029ecfdcc9eedbd7f04e570863cf4fa4feba6f18b36aad969c42cccb060ad20fd7f0a9d042926542df0c632f7fb7315c52f80890f4d54e4c8ea45e625b8e26b7356a71be9be345e571ae28157f52515c9afa0294cb0422447f402e8acba183ba8af52905483',
    STRAPI_CUSTOM_TOKEN: '3a6d77289ec18e648526934ef4b8c960a6181a0d636cd7f9a11d90e6c272a783ab772aab6e547ea0843e07cc657d2fc4d3e1e41acd24b2391ade4c81dcb4e073249ce0b0d3e8cb94e0b23429050783d703581ebc3d038cc5b67458136e762c9c21828f5218e98f68be42c00ed8855aefdc93a6f930f12a2ea0112e02a007a420',
    GOOGLE_CLIENT_ID: '1013147080834-kk07ufs7vfbbuj01ftht9idqgm8n500e.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '2ZCoq03s9HlbbMY36VardIgA',
    NEXTAUTH_SECRET: '2ZCoq03s9HlbbMY36VardIgA',
    NEXTAUTH_URL: 'http://localhost:3000',
    GA_MEASUREMENT_ID: 'G-0DL7SDZL7E',
    //#Peiraiws Bank
    ACQUIRER_ID: '14',
    MERCHANT_ID: '2141425445',
    POS_ID: '2138072006',
    PEIRAIWS_USERNAME: 'MA312637',
    PEIRAIWS_PASSWORD: 'TE212132',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      },
    ],
  },
}

module.exports = nextConfig
