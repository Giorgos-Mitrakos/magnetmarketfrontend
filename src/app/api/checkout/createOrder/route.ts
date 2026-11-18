// Δημιουργία παραγγελίας → Strapi POST /api/orders/checkout.
//
// Ο browser στέλνει την κατάσταση του ταμείου· εδώ κρατάμε ΜΟΝΟ τις επιλογές
// του πελάτη (buildOrderPayload) — τιμές, μεταφορικά, κόστος πληρωμής και
// έκπτωση τα υπολογίζει το Strapi. Αν ο πελάτης είναι συνδεδεμένος, η
// παραγγελία συνδέεται με τον λογαριασμό του (JWT από το session).
//
// Το cookie _mmo (αριθμός παραγγελίας για τις σελίδες «Ευχαριστούμε» /
// «Αποτυχία») το γράφει ΜΟΝΟ ο server, εδώ.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/app/api/auth/[...nextauth]/options";
import { buildOrderPayload } from "@/lib/helpers/checkoutPayload";
import { ICheckoutState } from "@/lib/interfaces/shipping";
import { publicErrorMessage, storefrontFetch } from "@/lib/helpers/storefrontApi";

export async function POST(req: NextRequest) {
    try {
        const { checkout } = await req.json() as { checkout: ICheckoutState }
        if (!checkout?.cart?.length) {
            return NextResponse.json({ status: "fail", message: "Το καλάθι είναι άδειο", orderId: null })
        }

        let jwt: string | null = null
        try {
            const session: any = await getSession()
            jwt = session?.user?.jwt ?? null
        } catch {
            jwt = null
        }

        // Προηγούμενη παραγγελία αυτού του browser (για νέα προσπάθεια πληρωμής
        // με κάρτα: συνεχίζει την ίδια παραγγελία αντί να φτιάξει νέα)
        let previousOrderDocumentId: string | undefined
        try {
            previousOrderDocumentId = JSON.parse((await cookies()).get('_mmo')?.value ?? '{}')?.orderId || undefined
        } catch {
            previousOrderDocumentId = undefined
        }

        const { data: order, meta } = await storefrontFetch<{ data: any, meta?: { reused?: boolean } }>('/orders/checkout', {
            body: { ...buildOrderPayload(checkout), previousOrderDocumentId },
            jwt,
        })

        const cookieStore = await cookies()
        cookieStore.set("_mmo", JSON.stringify({ orderId: order.documentId }), {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
        })

        return NextResponse.json({
            status: "success",
            message: "Η παραγγελία καταχωρήθηκε",
            orderId: order.documentId,
            orderNumber: order.order_number,
            amount: Number(order.total),
            installments: Number(order.installments) || 1,
            reused: !!meta?.reused,
        })
    } catch (error) {
        return NextResponse.json({
            status: "fail",
            message: publicErrorMessage(error, "Η παραγγελία δεν ολοκληρώθηκε. Παρακαλώ δοκιμάστε ξανά."),
            orderId: null,
        })
    }
}
