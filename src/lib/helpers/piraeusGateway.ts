'use server'

import { HmacSHA512,MD5 } from 'crypto-js';
import HmacSha256 from 'crypto-js/hmac-sha256'
import {env} from 'process'
const soap = require('soap');

export async function getTransactionTicket({ orderId, amount, installments }: { orderId: number, amount: number, installments: number }) {

    const soapTicketData = {Request:{
        Username: process.env.PEIRAIWS_USERNAME?process.env.PEIRAIWS_USERNAME:'MA312637',
        Password: process.env.PEIRAIWS_PASSWORD?MD5(process.env.PEIRAIWS_PASSWORD).toString():MD5('TE212132').toString(),
        MerchantId: process.env.MERCHANT_ID ? parseInt(process.env.MERCHANT_ID) : 2141425445,
        PosId: process.env.POS_ID ? parseInt(process.env.POS_ID) : 2138072006,
        AcquirerId: process.env.ACQUIRER_ID,
        MerchantReference: orderId,        
        RequestType: '02',        
        ExpirePreauth:0,
        Amount: amount,
        CurrencyCode: 978,
        Installments: installments || 1,
        Bnpl: 0,
        Parameters: ''
    }}

        console.log(soapTicketData)

    try {
        const url = 'https://paycenter.piraeusbank.gr/services/tickets/issuer.asmx?WSDL';

        soap.createClient(url, function(err:any, client:any) {
            
            if (err) {
                console.error(err);
            } else {
                // SOAP client object is created successfully
                client.IssueNewTicket(soapTicketData,async function(err:any, result:any) {
                    // console.log('Last SOAP Request:', client.lastRequest);
                    if (err) {
                        // console.error("ERRORRRR:",err, err.root?.Envelope?.Body);
                        const data=await err.toString()
                        const myInitData = {
                            method: "POST",
                            headers: { 'Content-Type': 'application/json', },
                            body: JSON.stringify({
                                to:'giorgos_mitrakos@yahoo.com',
                                    subject:"Αποτυχημένο request",
                                    text:data
                            })
                        };

                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sendEmail`,
                            myInitData,
                        )
                    } else {
                        // SOAP request is successful, and r
                        // esult contains the response data
                        const data=JSON.stringify(result.IssueNewTicketResult)
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
                    }
                });
            }
        });

        // console.log("response:", response)

    
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