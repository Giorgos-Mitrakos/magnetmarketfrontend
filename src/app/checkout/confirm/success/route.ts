import { NextRequest } from "next/server";
import { redirect } from 'next/navigation'
import { checkAuthResponse, getTicket, sendEmail } from "@/lib/helpers/piraeusGateway";

export async function POST(request: NextRequest) {

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

    const ticket = await getTicket({bankResponse:JSON.parse(res)})
    
    const isResponseAuth = await checkAuthResponse({ bankResponse: JSON.parse(res), ticket: ticket.TranTicket.TranTicket })

    if (isResponseAuth) {
        sendEmail({ title: "authenticated", data: "authenticated" })
    }
    // redirect('/checkout/thank-you')
    return new Response(JSON.stringify({ message: 'Payment processed successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}