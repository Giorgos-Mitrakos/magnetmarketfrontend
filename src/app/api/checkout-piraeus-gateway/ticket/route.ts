// import { useSearchParams } from "next/navigation";

import { getTransactionTicket, ITicketResponse, saveTicket, sendEmail } from "@/lib/helpers/piraeusGateway";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest, res: NextResponse) {
  // we will use params to access the data passed to the dynamic route
  // const user = params.user;

  const data = await request.json()

  const { orderId, amount, installments } = data


  // στέλνω στην τράπεζα τις πληροφορίες ώστε να μου αποστείλει πίσω το τικετ
  const response = await getTransactionTicket({
    orderId: orderId,
    amount: amount,
    installments: installments || 1
  })

  const ticketResponse = response as ITicketResponse

  const paymentData = {
    AcquirerId: process.env.ACQUIRER_ID,
    MerchantId: process.env.MERCHANT_ID,
    PosId: parseInt(`${process.env.POS_ID}`),
    User: process.env.PEIRAIWS_USERNAME,
    LanguageCode: 'el-GR',
    MerchantReference: orderId,
    ParamBackLink: 'https://magnetmarket.gr/checkout/confirm/order-summary',
  };


  if (parseInt(ticketResponse.ResultCode) === 0) {
    await saveTicket({ orderId: orderId, TranTicket: ticketResponse.TranTicket })
  }

  return new NextResponse(JSON.stringify(paymentData));
}