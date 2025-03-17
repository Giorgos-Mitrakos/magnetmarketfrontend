import { NextRequest } from "next/server";
import { redirect } from 'next/navigation'
import { sendEmail } from "@/lib/helpers/piraeusGateway";
import { title } from "process";

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

    console.log(response)
    
    sendEmail({ title: "Response from bank", data: JSON.stringify(response) })
    redirect('/checkout/thank-you')
    return new Response(JSON.stringify({ message: 'Payment processed successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}