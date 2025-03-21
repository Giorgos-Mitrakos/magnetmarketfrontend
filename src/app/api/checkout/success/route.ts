import { NextRequest, NextResponse } from "next/server";
import { checkAuthResponse, getTicket, saveBankResponse, sendEmail } from "@/lib/helpers/piraeusGateway";

export async function POST(req: NextRequest) {

    try {
        const transactionData = await req.formData();

        const responseTransactionData = {
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
        
        const resTransactionData = JSON.stringify(responseTransactionData)

        const ticket = await getTicket({ bankResponse: JSON.parse(resTransactionData) })

        if (ticket.Flag !== "success") {
            return NextResponse.redirect(new URL(`${process.env.NEXT_URL}/checkout/failure`));
        }

        const isResponseAuth = await checkAuthResponse({ bankResponse: JSON.parse(resTransactionData), ticket: ticket.ticket })

        if (!isResponseAuth) {
            const bankresp = await saveBankResponse({ bankResponse: responseTransactionData })
            
            return NextResponse.redirect(new URL(`${process.env.NEXT_URL}/checkout/failure`));
        }

        if (responseTransactionData.StatusFlag === 'Success') {
            const bankresp = await saveBankResponse({ bankResponse: responseTransactionData })
            const res = NextResponse.redirect((new URL(`${process.env.NEXT_URL}/checkout/thank-you`)))

            if (responseTransactionData.ApprovalCode) {
                res.cookies.set("ApprovalCode", responseTransactionData.ApprovalCode?.toString(), {
                    path: "/", // Cookie is available on all paths
                    httpOnly: true, // Can't be accessed via JavaScript
                    secure: true, // Only sent over HTTPS
                    sameSite: "strict", // Prevents CSRF attacks 
                    maxAge: 30 * 60
                });
            }
            if (responseTransactionData.MerchantReference)
                res.cookies.set("magnet_market_order", JSON.stringify({
                    orderId: responseTransactionData.MerchantReference?.toString()
                }), {
                    path: "/", // Cookie is available on all paths
                    httpOnly: true, // Can't be accessed via JavaScript
                    secure: true, // Only sent over HTTPS
                    sameSite: "strict", // Prevents CSRF attacks 
                    maxAge: 30 * 60
                });

            return res
            //  NextResponse.redirect(new URL(`${process.env.NEXT_URL}checkout/thank-you`));
        }
        else {
            await saveBankResponse({ bankResponse: responseTransactionData })
            return NextResponse.redirect(new URL(`${process.env.NEXT_URL}/checkout/failure`));
        }

        // sendEmail({ title: "authenticated", data: `authenticated:${isResponseAuth}, ticket: ${ticket}, resposeFromBank: ${res}` })


    } catch (error) {
        console.log(error)
        // sendEmail({ title: "Error in Respone", data: `Error: ${error}` })
        return NextResponse.redirect(new URL(`${process.env.NEXT_URL}`));
    }
}