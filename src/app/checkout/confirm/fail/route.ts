import { NextRequest, NextResponse } from "next/server";
import { checkAuthResponse, getTicket, saveBankResponse, sendEmail } from "@/lib/helpers/piraeusGateway";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {

    try {
        const transactionData = await request.formData();

        const response = {
            SupportReferenceID: transactionData.get('SupportReferenceID'),
            ResultCode: transactionData.get('ResultCode'),
            ResultDescription: transactionData.get('ResultDescription'),
            StatusFlag: transactionData.get('StatusFlag'),
            ResponseCode: transactionData.get('ResponseCode'),
            ResponseDescription: transactionData.get('ResponseDescription'),
            LanguageCode: transactionData.get('LanguageCode'),
            MerchantReference: transactionData.get('MerchantReference'),
            TransactionDateTime: transactionData.get('TransactionDateTime'),
            TransactionId: transactionData.get('TransactionId'),
            CardType: transactionData.get('CardType'),
            PackageNo: transactionData.get('PackageNo'),
            ApprovalCode: transactionData.get('ApprovalCode'),
            RetrievalRef: transactionData.get('RetrievalRef'),
            AuthStatus: transactionData.get('AuthStatus'),
            Parameters: transactionData.get('Parameters'),
            HashKey: transactionData.get('HashKey'),
            PaymentMethod: transactionData.get('PaymentMethod'),
            TraceID: transactionData.get('TraceID'),
        }

        const res = JSON.stringify(response)

        const ticket = await getTicket({ bankResponse: JSON.parse(res) })

        if (ticket.Flag !== "success") {

            return NextResponse.redirect(new URL(`${process.env.NEXT_URL}/checkout/failure`, `${process.env.NEXT_URL}`), 303);
        }

        sendEmail({ title: "Bank Response", data: `Bank Response:${JSON.stringify(response)}` })

        const isResponseAuth = await checkAuthResponse({ bankResponse: JSON.parse(res), ticket: ticket.ticket })

        if (!isResponseAuth) {
            await saveBankResponse({ bankResponse: response })

            return NextResponse.redirect(new URL(`/checkout/failure`, `${process.env.NEXT_URL}`), 303);
        }

        if (response.ResultCode?.toString() === '0') {
            await saveBankResponse({ bankResponse: response })
            sendEmail({ title: "Bank Response", data: `Bank Response:${JSON.stringify(response)}` })
            cookies().set("_rcf", JSON.stringify({ RCF: 1 }),
                {
                    path: "/", // Cookie is available on all paths
                    httpOnly: true, // Can't be accessed via JavaScript
                    secure: true, // Only sent over HTTPS
                    sameSite: "lax", // Prevents CSRF attacks 
                    maxAge: 10 * 60
                })
            return NextResponse.redirect(new URL(`${process.env.NEXT_URL}/checkout/failure`, `${process.env.NEXT_URL}`), 303);
        }

        if (response.StatusFlag === 'Success') {
            await saveBankResponse({ bankResponse: response })
            if (response.ApprovalCode) {
                cookies().set("ApprovalCode", JSON.stringify({ ApprovalCode: response.ApprovalCode?.toString() }),
                    {
                        path: "/", // Cookie is available on all paths
                        httpOnly: true, // Can't be accessed via JavaScript
                        secure: true, // Only sent over HTTPS
                        sameSite: "lax", // Prevents CSRF attacks 
                        maxAge: 10 * 60
                    })
            }
            if (response.MerchantReference) {
                cookies().set("magnet_market_order", JSON.stringify({
                    orderId: response.MerchantReference?.toString()
                }), {
                    path: "/", // Cookie is available on all paths
                    httpOnly: true, // Can't be accessed via JavaScript
                    secure: true, // Only sent over HTTPS
                    sameSite: "lax", // Prevents CSRF attacks 
                    maxAge: 10 * 60
                })
            }

            sendEmail({ title: "Success", data: `orderId:${response.MerchantReference?.toString()}` })

            return NextResponse.redirect(new URL(`/checkout/thank-you`, `${process.env.NEXT_URL}`), 303);
        }
        else {
            await saveBankResponse({ bankResponse: response })
            sendEmail({ title: "No Success", data: `orderId:${response.MerchantReference?.toString()}` })

            return NextResponse.redirect(new URL(`/checkout/failure`, `${process.env.NEXT_URL}`), 303);
        }

    } catch (error) {
        console.log(error)
        sendEmail({ title: "Error in Respone", data: `Error: ${error}` })
        return NextResponse.redirect(new URL(`${process.env.NEXT_URL}`), 303);
    }
}