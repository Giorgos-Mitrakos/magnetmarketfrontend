'use server'

import { HmacSHA512 } from 'crypto-js';
import HmacSha256 from 'crypto-js/hmac-sha256'

export async function getTransactionTicket({ orderId, amount, installments }: { orderId: number, amount: number, installments: number }) {

    const { env } = process

    const myInit = {
        method: "POST",
        // headers: myHeaders,
        body: JSON.stringify({
            AcquirerId: env.AcquirerId,
            MerchantId: env.MerchantId ? parseInt(env.MerchantId) : 2141425445,
            PosId: env.PosId ? parseInt(env.PosId) : 2138072006,
            Username: env.PEIRAIWS_USERNAME,
            Password: env.PEIRAIWS_PASSWORD,
            RequestType: '02',
            CurrencyCode: 978,
            MerchantReference: orderId,
            Amount: amount,
            Installments: installments || 1,
            ExpirePreauth: 0,
            Bnpl: 0,
            Parameters: ''
        })
    };
    
    // HmacSHA512('4236ece6142b4639925eb6f80217122f'+'99999999'+'14'+'Test'+'389700'+'MyParam'+'00'+'364629'+'02'+'1'+'Success',);

    const response = await fetch('https://paycenter.piraeusbank.gr/services/tickets/issuer.asmx',
        myInit
    )

    const data=await response.json()

    console.log("response:", data)

    return JSON.stringify(data)
}