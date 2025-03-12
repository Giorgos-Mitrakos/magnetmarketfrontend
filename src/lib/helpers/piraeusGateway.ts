'use server'

import { HmacSHA512 } from 'crypto-js';
import HmacSha256 from 'crypto-js/hmac-sha256'
import {env} from 'process'
const soap = require('soap');

export async function getTransactionTicket({ orderId, amount, installments }: { orderId: number, amount: number, installments: number }) {

    const soapTicketData = {        
            AcquirerId: process.env.AcquirerId,
            MerchantId: process.env.MerchantId ? parseInt(process.env.MerchantId) : 2141425445,
            PosId: process.env.PosId ? parseInt(process.env.PosId) : 2138072006,
            Username: process.env.PEIRAIWS_USERNAME?process.env.PEIRAIWS_USERNAME:'MA312637',
            Password: process.env.PEIRAIWS_PASSWORD?process.env.PEIRAIWS_PASSWORD:'TE212132',
            RequestType: '02',
            CurrencyCode: 978,
            MerchantReference: orderId,
            Amount: amount,
            Installments: installments || 1,
            ExpirePreauth: 0,
            Bnpl: 0,
            Parameters: ''
        }

    try {
        const url = 'https://paycenter.piraeusbank.gr/services/tickets/issuer.asmx?WSDL';

        soap.createClient(url, function(err:any, client:any) {
            
            if (err) {
                console.error(err);
            } else {
                // SOAP client object is created successfully
                client.IssueNewTicket(soapTicketData,async function(err:any, result:any) {
                    console.log('Last SOAP Request:', client.lastRequest);
                    if (err) {
                        // console.error("ERRORRRR:",err);
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
                        const data=result
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