import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, res: NextResponse) {
    // we will use params to access the data passed to the dynamic route
    // const user = params.user;

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
    return NextResponse.redirect(new URL(`/checkout/order-summary`, `${process.env.NEXT_URL}`), 303);
}