'use server'

import { data } from 'autoprefixer';
import { HmacSHA512, MD5 } from 'crypto-js';
import HmacSha256 from 'crypto-js/hmac-sha256'
import { env, title } from 'process'
const soap = require('soap');

export interface ITicketResponse{
    status: string,
    ResultCode: string
    ResultDescription: string,
    TranTicket: string,
    TimeStamp: Date,
    MinutesToExpiration: number
}

export async function sendEmail({ title, data }: { title: string, data: string }) {
    try {
        const myInitData = {
            method: "POST",
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({
                to: 'giorgos_mitrakos@yahoo.com',
                subject: title,
                text: data
            })
        };

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sendEmail`,
            myInitData,
        )
    } catch (error) {

    }
}

export async function saveTicket({ orderId, TranTicket }: { orderId: number, TranTicket: string }) {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/saveTicket`,
            {
                method: "POST",
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    orderId: orderId,
                    TransTicket: TranTicket,
                })
            }
        )
    } catch (error) {

    }
}

function convertResult({ status, result }: { status: string, result: any }) {
    const data = JSON.parse(result)
    return {
        status: status,
        ResultCode: data.IssueNewTicketResult.ResultCode,
        ResultDescription: data.IssueNewTicketResult.ResultDescription,
        TranTicket: data.IssueNewTicketResult.TranTicket,
        TimeStamp: data.IssueNewTicketResult.TimeStamp,
        MinutesToExpiration: data.IssueNewTicketResult.MinutesToExpiration
    }
}

export async function getTransactionTicket({ orderId, amount, installments }: { orderId: number, amount: number, installments: number }) {

    const soapTicketData = {
        Request: {
            Username: process.env.PEIRAIWS_USERNAME,
            Password: MD5(`${process.env.PEIRAIWS_PASSWORD}`).toString(),
            MerchantId: process.env.MERCHANT_ID,
            PosId: parseInt(`${process.env.POS_ID}`),
            AcquirerId: process.env.ACQUIRER_ID,
            MerchantReference: orderId,
            RequestType: '02',
            ExpirePreauth: 0,
            Amount: amount,
            CurrencyCode: 978,
            Installments: installments || 1,
            Bnpl: 0,
            Parameters: ''
        }
    }

    try {
        const url = 'https://paycenter.piraeusbank.gr/services/tickets/issuer.asmx?WSDL';
       
        const response = await new Promise((resolve, reject) => {
            soap.createClient(url, async function (err: any, client: any) {
                let responseData = {}
                if (err) {
                    console.error(err);
                    await sendEmail({ title: "Αποτυχημένο request", data: err.toString() })
                } else {
                    // SOAP client object is created successfully
                    const responseData = await new Promise((resolve, reject) => {
                        client.IssueNewTicket(soapTicketData, async function (err: any, result: any) {
                            // console.log('Last SOAP Request:', client.lastRequest);
                            if (err) {
                                // console.error("ERRORRRR:",err, err.root?.Envelope?.Body);
                                const data = await err.toString()
                                resolve(convertResult({ status: "fail", result: JSON.stringify(data) }))
                            } else {
                                // SOAP request is successful, and r
                                // esult contains the response data
                                resolve(convertResult({ status: "success", result: JSON.stringify(result) }))                                
                            }
                        });
                    })

                    resolve(responseData)
                }
            });
        })

        return response
    } catch (error) {
        const myInitData = {
            method: "POST",
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({
                to: 'giorgos_mitrakos@yahoo.com',
                subject: "Αποτυχημένο request",
                text: error
            })
        };

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sendEmail`,
            myInitData,
        )
        // console.log(error)
        // const data = await error.toString()
        return convertResult({ status: "fail", result: JSON.stringify(error) })

    }


}