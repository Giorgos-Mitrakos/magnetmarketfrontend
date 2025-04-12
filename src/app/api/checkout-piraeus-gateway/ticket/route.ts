// import { useSearchParams } from "next/navigation";

import { getTransactionTicket, ITicketResponse, saveTicket, sendEmail } from "@/lib/helpers/piraeusGateway";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest, res: NextResponse) {
  // we will use params to access the data passed to the dynamic route
  // const user = params.user;
  try {
    const data = await request.json()

    const { orderId, amount } = data
    const installments = Number(data.installments) || 1;

    const {
      ACQUIRER_ID,
      MERCHANT_ID,
      POS_ID,
      PEIRAIWS_USERNAME
    } = process.env;

    if (!ACQUIRER_ID || !MERCHANT_ID || !POS_ID || !PEIRAIWS_USERNAME) {
      return new NextResponse(JSON.stringify({ error: 'Missing payment credentials' }), { status: 500 });
    }


    // στέλνω στην τράπεζα τις πληροφορίες ώστε να μου αποστείλει πίσω το τικετ
    const response = await getTransactionTicket({
      orderId: orderId,
      amount: amount,
      installments: installments
    })

    const ticketResponse = response as ITicketResponse

    const paymentData = {
      AcquirerId: Number(ACQUIRER_ID),
      MerchantId: Number(MERCHANT_ID),
      PosId: Number(POS_ID),
      User: PEIRAIWS_USERNAME,
      LanguageCode: 'el-GR',
      MerchantReference: orderId,
      ParamBackLink: 'https://magnetmarket.gr/checkout/confirm/order-summary',
    };


    if (parseInt(ticketResponse.ResultCode) === 0) {
      await saveTicket({ orderId: orderId, TranTicket: ticketResponse.TranTicket })
    } else {
      console.error('Piraeus error:', ticketResponse);
      return new NextResponse(JSON.stringify({ error: 'Piraeus returned error', details: ticketResponse }), { status: 502 });
    }

    return new NextResponse(JSON.stringify(paymentData));
  } catch (err) {
    console.error('Unexpected error:', err);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}