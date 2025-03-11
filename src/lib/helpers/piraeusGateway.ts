'use server'

import { HmacSHA512 } from 'crypto-js';
import HmacSha256 from 'crypto-js/hmac-sha256'

export async function getTransactionTicket({ orderId, amount, installments }: { orderId: number, amount: number, installments: number }) {

    const { env } = process

    const myInit = {
        method: "POST",
        headers: { 'Content-Type': 'application/json', },
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

    try {
        const response = await fetch('https://paycenter.piraeusbank.gr/services/tickets/issuer.asmx',
            myInit
        )

        // console.log("response:", response)

    const data=await response.text()
    const myInitData = {
        method: "POST",
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
            to:'giorgos_mitrakos@yahoo.com',
                 subject:"Επίτυχημένο request",
                 text:data
        })        
    };

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sendEmail`,
        myInitData,
    )
    } catch (error) {
        const myInitData = {
            method: "POST",
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({
                to:'giorgos_mitrakos@yahoo.com',
                 subject:"Αποτυχημένο request",
                 text:error
            })        
        };
    
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sendEmail`,
            myInitData,
        )
        console.log(error)
    }
    

    

    const responseData = {
        ResultCode: '0',
        ResultDescription: "",
        TransTicket: '4236ece6142b4639925eb6f80217122f',
        TimeStamp: new Date(),
        MinutesToExpiration: 30
    }

    return responseData
}

// export async function saveTicket(params:type) {
    
// }