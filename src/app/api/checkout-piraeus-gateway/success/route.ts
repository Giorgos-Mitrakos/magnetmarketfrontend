// Η τράπεζα επιστρέφει εδώ (POST form) μετά από πληρωμή.
//
// (2026-10-14) Η πληρωμή θεωρείται επιτυχής ΜΟΝΟ αν η υπογραφή (HashKey)
// επαληθευτεί με το εισιτήριο που αποθηκεύσαμε ΕΜΕΙΣ για αυτή την
// παραγγελία. Το αποτέλεσμα το καταγράφει το Strapi (πληρωμένη →
// «Επιβεβαιωμένη» + email στον πελάτη και στην ομάδα).
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { checkAuthResponse, getTicket, notifyAdmin, readBankResponse, recordPaymentResult, redirectHtml } from "@/lib/helpers/piraeusGateway";

const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax" as const,
    maxAge: 60 * 60,
}

export async function POST(request: NextRequest) {
    let reference = ''
    try {
        const bankResponse = readBankResponse(await request.formData())
        reference = bankResponse.MerchantReference

        const ticket = await getTicket(bankResponse.MerchantReference)
        const signatureOk = !!ticket && checkAuthResponse({ bankResponse, ticket })

        if (!signatureOk) {
            // Δεν καταγράφουμε τίποτα ως αποτέλεσμα: απάντηση χωρίς έγκυρη υπογραφή
            notifyAdmin({
                title: 'Πειραιώς: απάντηση με άκυρη υπογραφή',
                data: `Παραγγελία ${reference}, StatusFlag ${bankResponse.StatusFlag}, ResultCode ${bankResponse.ResultCode}`,
            })
            return redirectHtml('/checkout/failure')
        }

        const success = bankResponse.StatusFlag === 'Success' && String(bankResponse.ResultCode) === '0'
        const result = await recordPaymentResult(bankResponse, success)

        const cookieStore = await cookies()
        if (success) {
            if (bankResponse.ApprovalCode) {
                cookieStore.set("_apc", JSON.stringify({ ApprovalCode: bankResponse.ApprovalCode }), cookieOptions)
            }
            cookieStore.set("_mmo", JSON.stringify({ orderId: result.documentId }), cookieOptions)
            return redirectHtml('/checkout/thank-you')
        }

        cookieStore.set("_mmo", JSON.stringify({ orderId: result.documentId }), cookieOptions)
        return redirectHtml('/checkout/failure')
    } catch (error) {
        console.error('Piraeus success:', error)
        notifyAdmin({ title: 'Πειραιώς: σφάλμα στην επιστροφή από την τράπεζα', data: `Παραγγελία ${reference}: ${String(error)}` })
        return redirectHtml('/checkout/failure')
    }
}
