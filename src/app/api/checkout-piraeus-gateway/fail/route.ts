import { NextRequest, NextResponse } from "next/server";
import { saveBankResponse, sendEmail } from "@/lib/helpers/piraeusGateway";
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

        if (response.ResultCode) {
            await saveBankResponse({ bankResponse: response })

            let resultCode = 0

            const intResultCode = parseInt(response.ResultCode.toString())
            if (intResultCode === 0) {
                resultCode = 1
            }
            else if (intResultCode === 1048) {
                resultCode = 2
            }
            else if (intResultCode >= 500 && intResultCode < 600) {
                resultCode = 3
            }
            else if (intResultCode === 981) {
                resultCode = 4
            }
            else if (intResultCode === 1045 || intResultCode === 1072) {
                resultCode = 5
            }
            else if (intResultCode === 1) {
                resultCode = 6
            }

            if (resultCode !== 0) {
                cookies().set("_rcf", JSON.stringify({ RCF: resultCode }),
                    {
                        path: "/", // Cookie is available on all paths
                        httpOnly: true, // Can't be accessed via JavaScript
                        secure: true, // Only sent over HTTPS
                        sameSite: "lax", // Prevents CSRF attacks 
                        maxAge: 10 * 60
                    })
            }

            return new NextResponse(`
                <html>
                  <head>
                    <meta http-equiv="refresh" content="0;url=/checkout/failure" />
                    <script>window.location.href = "/checkout/failure"</script>
                  </head>
                  <body>Redirecting...</body>
                </html>
              `, {
                headers: {
                    'Content-Type': 'text/html',
                },
            })

        }
        else {
            await saveBankResponse({ bankResponse: response })
            sendEmail({ title: "No Success", data: `orderId:${response.MerchantReference?.toString()}` })

            return new NextResponse(`
                <html>
                  <head>
                    <meta http-equiv="refresh" content="0;url=/checkout/failure" />
                    <script>window.location.href = "/checkout/failure"</script>
                  </head>
                  <body>Redirecting...</body>
                </html>
              `, {
                headers: {
                    'Content-Type': 'text/html',
                },
            })
        }

    } catch (error) {
        console.log(error)
        sendEmail({ title: "Error in Respone", data: `Error: ${error}` })
        
        return new NextResponse(`
            <html>
              <head>
                <meta http-equiv="refresh" content="0;url=/checkout/failure" />
                <script>window.location.href = "/checkout/failure"</script>
              </head>
              <body>Redirecting...</body>
            </html>
          `, {
            headers: {
                'Content-Type': 'text/html',
            },
        })
    }
}