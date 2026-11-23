// Έκδοση εισιτηρίου πληρωμής στην Τράπεζα Πειραιώς (κάρτα / IRIS).
//
// (2026-10-14) Το ποσό και οι δόσεις ΔΕΝ έρχονται πια από τον browser: τα
// παίρνουμε από την παραγγελία στο Strapi (preparePayment). Η παραγγελία
// πρέπει να είναι αυτή του cookie _mmo (τη γράφει ο server στη δημιουργία).
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getTransactionTicket, notifyAdmin, preparePayment, saveTicket } from "@/lib/helpers/piraeusGateway";
import { publicErrorMessage } from "@/lib/helpers/storefrontApi";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json().catch(() => ({}))
    const orderId = String(data?.orderId ?? '')

    let cookieOrderId = ''
    try {
      cookieOrderId = String(JSON.parse((await cookies()).get('_mmo')?.value ?? '{}')?.orderId ?? '')
    } catch {
      cookieOrderId = ''
    }
    if (!orderId || orderId !== cookieOrderId) {
      return NextResponse.json({ error: 'Η παραγγελία δεν βρέθηκε' }, { status: 404 })
    }

    const ACQUIRER_ID = process.env.ACQUIRER_ID
    const MERCHANT_ID = process.env.MERCHANT_ID
    const POS_ID = process.env.POS_ID
    const PEIRAIWS_USERNAME = process.env.PEIRAIWS_USERNAME
    if (!ACQUIRER_ID || !MERCHANT_ID || !POS_ID || !PEIRAIWS_USERNAME || !process.env.PEIRAIWS_PASSWORD) {
      console.error('Piraeus: λείπουν στοιχεία στο .env.local')
      return NextResponse.json({ error: 'Η πληρωμή με κάρτα δεν είναι διαθέσιμη αυτή τη στιγμή' }, { status: 500 })
    }

    // Ποσό / δόσεις / αριθμός παραγγελίας από το Strapi
    const payment = await preparePayment(orderId)

    const ticketResponse = await getTransactionTicket({
      merchantReference: payment.merchantReference,
      amount: payment.amount,
      installments: payment.installments,
    })

    if (parseInt(String(ticketResponse.ResultCode)) !== 0 || !ticketResponse.TranTicket) {
      console.error('Piraeus error:', ticketResponse)
      notifyAdmin({
        title: 'Πειραιώς: η τράπεζα δεν εξέδωσε εισιτήριο',
        data: `Παραγγελία ${payment.merchantReference}: ${ticketResponse.ResultCode} ${ticketResponse.ResultDescription ?? ''}`,
      })
      return NextResponse.json({ error: 'Η τράπεζα δεν απάντησε. Παρακαλώ δοκιμάστε ξανά.' }, { status: 502 })
    }

    await saveTicket({ merchantReference: payment.merchantReference, tranTicket: ticketResponse.TranTicket })

    // (2026-11-23) Το ParamBackLink ΠΡΕΠΕΙ να στέλνεται στη φόρμα της τράπεζας.
    // Είχε αφαιρεθεί (14/10) και από το άνοιγμα ΚΑΜΙΑ πληρωμή με κάρτα δεν
    // πέτυχε: η τράπεζα γύριζε τον πελάτη στο /fail χωρίς να δημιουργηθεί
    // συναλλαγή στο back office. Ο παλιός κώδικας (tag live-old), που δούλευε,
    // έστελνε URL — κρατάμε την ίδια μορφή, με τη σελίδα σύνοψης του νέου site.
    const siteUrl = (process.env.NEXT_URL || 'https://magnetmarket.gr').replace(/\/+$/, '')
    return NextResponse.json({
      AcquirerId: Number(ACQUIRER_ID),
      MerchantId: Number(MERCHANT_ID),
      PosId: Number(POS_ID),
      User: PEIRAIWS_USERNAME,
      LanguageCode: 'el-GR',
      MerchantReference: payment.merchantReference,
      ParamBackLink: `${siteUrl}/checkout/order-summary`,
    })
  } catch (err) {
    console.error('Piraeus ticket:', err)
    return NextResponse.json({ error: publicErrorMessage(err) }, { status: 500 })
  }
}
