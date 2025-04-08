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

        await sendEmail({ title: 'bank response', data: res })

        const ticket = await getTicket({ bankResponse: JSON.parse(res) })

        if (ticket.Flag !== "success") {
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

        const isResponseAuth = await checkAuthResponse({ bankResponse: JSON.parse(res), ticket: ticket.ticket })

        if (!isResponseAuth) {
            await saveBankResponse({ bankResponse: response })
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

        if (response.StatusFlag === 'Success' && response.ResultCode?.toString() === '0') {
            await saveBankResponse({ bankResponse: response })
            if (response.ApprovalCode) {
                cookies().set("_apc", JSON.stringify({ ApprovalCode: response.ApprovalCode?.toString() }),
                    {
                        path: "/", // Cookie is available on all paths
                        httpOnly: true, // Can't be accessed via JavaScript
                        secure: true, // Only sent over HTTPS
                        sameSite: "lax", // Prevents CSRF attacks 
                        maxAge: 10 * 60
                    })
            }
            if (response.MerchantReference) {
                cookies().set("_mmo", JSON.stringify({
                    orderId: response.MerchantReference?.toString()
                }), {
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
                    <meta http-equiv="refresh" content="0;url=/checkout/thank-you" />
                    <script>window.location.href = "/checkout/thank-you"</script>
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
        return new NextResponse(`
            <html>
              <head>
                <meta http-equiv="refresh" content="0;url=/" />
                <script>window.location.href = "/"</script>
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