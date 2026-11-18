// lib/helpers/piraeusGateway.ts
//
// Πληρωμή μέσω Τράπεζας Πειραιώς (κάρτα / IRIS) — ΜΟΝΟ στον server του Next.js.
//
// (2026-10-14) Δεν είναι πια αρχείο 'use server': οι συναρτήσεις εδώ ΔΕΝ
// πρέπει να καλούνται από τον browser (πριν, ο καθένας μπορούσε να εκδώσει
// εισιτήριο με όποιο ποσό ήθελε ή να γράψει «απάντηση τράπεζας»). Τις
// χρησιμοποιούν μόνο τα API routes του /api/checkout-piraeus-gateway.
//
// Ροή:
//  1. ticket route: Strapi → στοιχεία παραγγελίας (ποσό/δόσεις ΑΠΟ ΤΗΝ
//     ΠΑΡΑΓΓΕΛΙΑ) → IssueNewTicket στην τράπεζα → Strapi αποθηκεύει το εισιτήριο
//  2. ο πελάτης πληρώνει στη σελίδα της τράπεζας
//  3. success/fail route: έλεγχος υπογραφής (HMAC-SHA256 με κλειδί το
//     αποθηκευμένο εισιτήριο) → Strapi καταγράφει το αποτέλεσμα (πληρωμένη /
//     αποτυχημένη)
//
// .env.local: ACQUIRER_ID, MERCHANT_ID, POS_ID, PEIRAIWS_USERNAME,
//             PEIRAIWS_PASSWORD, STOREFRONT_SECRET, NEXT_URL

import { MD5 } from 'crypto-js';
import { storefrontFetch } from './storefrontApi';
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

/** Τα πεδία που στέλνει η τράπεζα (POST form) στα success / fail URLs */
export const BANK_RESPONSE_FIELDS = [
    'SupportReferenceID', 'ResultCode', 'ResultDescription', 'StatusFlag', 'ResponseCode',
    'ResponseDescription', 'LanguageCode', 'MerchantReference', 'TransactionDateTime',
    'TransactionId', 'CardType', 'PackageNo', 'ApprovalCode', 'RetrievalRef', 'AuthStatus',
    'Parameters', 'HashKey', 'PaymentMethod', 'TraceID',
] as const

export type IBankResponse = Record<(typeof BANK_RESPONSE_FIELDS)[number], string>

export function readBankResponse(form: FormData): IBankResponse {
    const out: Record<string, string> = {}
    for (const key of BANK_RESPONSE_FIELDS) {
        const v = form.get(key)
        out[key] = v == null ? '' : String(v)
    }
    return out as IBankResponse
}

/** Ειδοποίηση της ομάδας (email από το Strapi, με όριο ανά ώρα) */
export async function notifyAdmin({ title, data }: { title: string, data: string }) {
    try {
        await storefrontFetch('/storefront/notify-admin', { body: { subject: title, text: data } })
    } catch (error) {
        console.error('notifyAdmin:', error)
    }
}

/** Στοιχεία πληρωμής από την παραγγελία — ποτέ από τον browser */
export async function preparePayment(orderDocumentId: string) {
    return storefrontFetch<{ merchantReference: string, amount: number, installments: number, method: string }>(
        '/storefront/payments/prepare',
        { body: { orderDocumentId } }
    )
}

export async function saveTicket({ merchantReference, tranTicket }: { merchantReference: string, tranTicket: string }) {
    return storefrontFetch('/storefront/payments/ticket', { body: { merchantReference, tranTicket } })
}

export async function getTicket(merchantReference: string): Promise<string | null> {
    if (!merchantReference) return null
    try {
        const res = await storefrontFetch<{ ticket: string | null }>('/storefront/payments/ticket-lookup', {
            body: { merchantReference },
        })
        return res.ticket ?? null
    } catch (error) {
        console.error('getTicket:', error)
        return null
    }
}

/** Καταγραφή αποτελέσματος στο Strapi. success μόνο ΜΕΤΑ τον έλεγχο υπογραφής. */
export async function recordPaymentResult(bankResponse: IBankResponse, success: boolean) {
    const { HashKey, Parameters, LanguageCode, ...bank } = bankResponse
    void HashKey; void Parameters; void LanguageCode
    return storefrontFetch<{ status: 'paid' | 'already_paid' | 'failed', documentId: string }>(
        '/storefront/payments/result',
        { body: { merchantReference: bankResponse.MerchantReference, success, bank } }
    )
}

function convertResult({ status, result }: { status: string, result: any }): ITicketResponse {
    const data = typeof result === 'string' ? JSON.parse(result) : result
    return {
        status: status,
        ResultCode: data?.IssueNewTicketResult?.ResultCode,
        ResultDescription: data?.IssueNewTicketResult?.ResultDescription,
        TranTicket: data?.IssueNewTicketResult?.TranTicket,
        TimeStamp: data?.IssueNewTicketResult?.TimeStamp,
        MinutesToExpiration: data?.IssueNewTicketResult?.MinutesToExpiration
    }
}

/** IssueNewTicket (SOAP) — έκδοση εισιτηρίου συναλλαγής στην τράπεζα */
export async function getTransactionTicket({ merchantReference, amount, installments }:
    { merchantReference: string, amount: number, installments: number }): Promise<ITicketResponse> {

    const soapTicketData = {
        Request: {
            Username: process.env.PEIRAIWS_USERNAME,
            Password: MD5(`${process.env.PEIRAIWS_PASSWORD}`).toString(),
            MerchantId: process.env.MERCHANT_ID,
            PosId: parseInt(`${process.env.POS_ID}`),
            AcquirerId: process.env.ACQUIRER_ID,
            MerchantReference: merchantReference,
            RequestType: '02',
            ExpirePreauth: 0,
            Amount: amount,
            CurrencyCode: 978,
            Installments: installments || 1,
            Bnpl: 0,
            Parameters: ''
        }
    }

    const url = 'https://paycenter.piraeusbank.gr/services/tickets/issuer.asmx?WSDL';

    try {
        return await new Promise<ITicketResponse>((resolve) => {
            soap.createClient(url, (err: any, client: any) => {
                if (err) {
                    console.error(err);
                    notifyAdmin({ title: "Πειραιώς: αποτυχία σύνδεσης για εισιτήριο", data: String(err) })
                    resolve({ status: 'fail', ResultCode: '-1', ResultDescription: String(err) } as ITicketResponse)
                    return
                }
                client.IssueNewTicket(soapTicketData, (err2: any, result: any) => {
                    if (err2) {
                        resolve({ status: 'fail', ResultCode: '-1', ResultDescription: String(err2) } as ITicketResponse)
                    } else {
                        resolve(convertResult({ status: "success", result }))
                    }
                });
            });
        })
    } catch (error) {
        notifyAdmin({ title: "Πειραιώς: αποτυχία έκδοσης εισιτηρίου", data: String(error) })
        return { status: 'fail', ResultCode: '-1', ResultDescription: String(error) } as ITicketResponse
    }
}

/** Έλεγχος υπογραφής της απάντησης της τράπεζας (HMAC-SHA256, κλειδί = εισιτήριο) */
export function checkAuthResponse({ bankResponse, ticket }: { bankResponse: IBankResponse, ticket: string }): boolean {
    try {
        if (!ticket || !bankResponse.HashKey) return false
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

        return hashString === String(bankResponse.HashKey).toUpperCase()
    } catch (error) {
        console.error(error)
        return false
    }
}

/** Σελίδα που κάνει redirect (η τράπεζα κάνει POST στο route μας) */
export function redirectHtml(path: string) {
    const safe = path.replace(/[^\w\-\/]/g, '')
    return new Response(`<html>
  <head>
    <meta http-equiv="refresh" content="0;url=${safe}" />
    <script>window.location.href = "${safe}"</script>
  </head>
  <body>Ανακατεύθυνση...</body>
</html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
