'use server'

import { HmacSHA512, MD5 } from 'crypto-js';
const soap = require('soap');
const CryptoJS = require('crypto-js');

export interface ITicketResponse {
    status: string,
    ResultCode: string
    ResultDescription: string,
    TranTicket: string,
    TimeStamp: Date,
    MinutesToExpiration: number
}

interface IBankResponse {
    SupportReferenceID: FormDataEntryValue | null,
    ResultCode: FormDataEntryValue | null,
    ResultDescription: FormDataEntryValue | null,
    StatusFlag: FormDataEntryValue | null,
    ResponseCode: FormDataEntryValue | null,
    ResponseDescription: FormDataEntryValue | null,
    LanguageCode: FormDataEntryValue | null,
    MerchantReference: FormDataEntryValue | null,
    TransactionDateTime: FormDataEntryValue | null,
    TransactionId: FormDataEntryValue | null,
    CardType: FormDataEntryValue | null,
    PackageNo: FormDataEntryValue | null,
    ApprovalCode: FormDataEntryValue | null,
    RetrievalRef: FormDataEntryValue | null,
    AuthStatus: FormDataEntryValue | null,
    Parameters: FormDataEntryValue | null,
    HashKey: FormDataEntryValue | null,
    PaymentMethod: FormDataEntryValue | null,
    TraceID: FormDataEntryValue | null,
}


export async function sendEmail({ title, data }: { title: string, data: string }) {
    try {
        const myInitData = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.ADMIN_JWT_SECRET}`,
            },
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
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.ADMIN_JWT_SECRET}`,
                },
                body: JSON.stringify({
                    orderId: orderId,
                    TransTicket: TranTicket,
                })
            }
        )
    } catch (error) {
        console.log(error)
    }
}

export async function getTicket({ bankResponse }: { bankResponse: IBankResponse }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/getTicket`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.ADMIN_JWT_SECRET}`,
                },
                body: JSON.stringify({
                    orderId: bankResponse.MerchantReference,
                })
            })

        const ticket = await response.json()

        return ticket
    } catch (error) {
        console.log(error)
    }
}

export async function saveBankResponse({ bankResponse }: { bankResponse: IBankResponse }) {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/saveTicket`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.ADMIN_JWT_SECRET}`,
                },
                body: JSON.stringify({
                    "bankResponse": {
                        SupportReferenceID: bankResponse.SupportReferenceID,
                        MerchantReference: bankResponse.MerchantReference,
                        StatusFlag: bankResponse.StatusFlag,
                        ResponseCode: bankResponse.ResponseCode,
                        ResponseDescription: bankResponse.ResponseDescription,
                        ApprovalCode: bankResponse.ApprovalCode,
                        PackageNo: bankResponse.PackageNo,
                        AuthStatus: bankResponse.AuthStatus
                    }
                })
            }
        )
    } catch (error) {
        console.log(error)
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

        return convertResult({ status: "fail", result: JSON.stringify(error) })

    }


}

export async function checkAuthResponse({ bankResponse, ticket }: { bankResponse: IBankResponse, ticket: string }) {
    try {
        const message = [
            ticket,
            process.env.POS_ID,
            process.env.ACQUIRER_ID,
            bankResponse.MerchantReference,
            bankResponse.ApprovalCode,
            bankResponse.Parameters,
            bankResponse.ResponseCode,
            bankResponse.SupportReferenceID,
            bankResponse.AuthStatus,
            bankResponse.PackageNo,
            bankResponse.StatusFlag].join(';')

        const hash = CryptoJS.HmacSHA256(message, ticket);

        const hashString = hash.toString(CryptoJS.enc.Hex).toUpperCase()
        // if (hashString === bankResponse.HashKey)
        return hashString === bankResponse.HashKey
    } catch (error) {
        console.log(error)
    }
}