// Η τράπεζα επιστρέφει εδώ (POST form) όταν η πληρωμή απέτυχε.
//
// (2026-10-14) Αν η υπογραφή επαληθευτεί, το Strapi καταγράφει την αποτυχία
// και αποδεσμεύει απόθεμα/κουπόνι (η παραγγελία γίνεται «Αποτυχημένη» — ο
// πελάτης ξαναδοκιμάζει από το καλάθι, που μένει γεμάτο).
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { checkAuthResponse, getTicket, notifyAdmin, readBankResponse, recordPaymentResult, redirectHtml } from "@/lib/helpers/piraeusGateway";

/** Κατηγορία μηνύματος για τη σελίδα αποτυχίας (cookie _rcf) */
function resultCategory(resultCode: string): number {
    const code = parseInt(resultCode)
    if (Number.isNaN(code)) return 0
    if (code === 0) return 1
    if (code === 1048) return 2
    if (code >= 500 && code < 600) return 3
    if (code === 981) return 4
    if (code === 1045 || code === 1072) return 5
    if (code === 1) return 6
    return 0
}

export async function POST(request: NextRequest) {
    try {
        const bankResponse = readBankResponse(await request.formData())

        // (2026-11-23) Πάντα καταγραφή του λόγου αποτυχίας (log + email στην ομάδα),
        // ακόμα κι όταν η απάντηση δεν έχει υπογραφή — αλλιώς ο κωδικός της
        // τράπεζας χανόταν και δεν ξέραμε γιατί απέτυχε η πληρωμή.
        const reason = [
            `Παραγγελία ${bankResponse.MerchantReference || '—'}`,
            `ResultCode ${bankResponse.ResultCode || '—'} ${bankResponse.ResultDescription || ''}`.trim(),
            `ResponseCode ${bankResponse.ResponseCode || '—'} ${bankResponse.ResponseDescription || ''}`.trim(),
            `StatusFlag ${bankResponse.StatusFlag || '—'}`,
            `Υπογραφή ${bankResponse.HashKey ? 'ναι' : 'όχι'}`,
        ].join(' · ')
        console.error('Piraeus fail:', reason)
        notifyAdmin({ title: 'Πειραιώς: αποτυχία πληρωμής', data: reason })

        const category = resultCategory(bankResponse.ResultCode)
        if (category !== 0) {
            const cookieStore = await cookies()
            cookieStore.set("_rcf", JSON.stringify({ RCF: category }), {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "lax",
                maxAge: 10 * 60,
            })
        }

        // Καταγραφή μόνο με έγκυρη υπογραφή — αλλιώς ο καθένας θα μπορούσε να
        // «ακυρώνει» παραγγελίες άλλων. Χωρίς υπογραφή η παραγγελία λήγει
        // αυτόματα (ORDER_CARD_TIMEOUT_ENABLED στο Strapi).
        const ticket = await getTicket(bankResponse.MerchantReference)
        if (ticket && bankResponse.HashKey && checkAuthResponse({ bankResponse, ticket })) {
            await recordPaymentResult(bankResponse, false)
        }
    } catch (error) {
        console.error('Piraeus fail:', error)
    }
    return redirectHtml('/checkout/failure')
}

// (2026-11-23) Ανανέωση/«Πίσω» στη σελίδα της επιστροφής → κανονική σελίδα αποτυχίας (αντί για 405)
export async function GET() {
    return redirectHtml('/checkout/failure')
}
