// import { useSearchParams } from "next/navigation";

import { getTransactionTicket, ITicketResponse, saveTicket, sendEmail } from "@/lib/helpers/piraeusGateway";
const CryptoJS = require('crypto-js');
import { redirect } from "next/navigation";
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
    ParamBackLink: 'https://magnetmarket.gr/checkout/confirm/success',
  };


  if (parseInt(ticketResponse.ResultCode) === 0) {
    await saveTicket({ orderId: orderId, TranTicket: ticketResponse.TranTicket })
  }

  // // const ticket = await getTransactionTicket({ orderId, amount, installments })
  // const ticket = '4236ece6142b4639925eb6f80217122f'
  // const posId = process.env.POS_ID
  // const AcquirerId = process.env.ACQUIRER_ID
  // const MerchantReference = 'Test'
  // const ApprovalCode = '389700'
  // const Parameters = 'MyParam'
  // const ResponseCode = '00'
  // const SupportReferenceId = '364629'
  // const AuthStatus = '02'
  // const PackageNo = '1'
  // const StatusFlag = 'Success'

  // const message = [
  //   ticket,
  //   posId,
  //   AcquirerId,
  //   MerchantReference,
  //   ApprovalCode,
  //   Parameters,
  //   ResponseCode,
  //   SupportReferenceId,
  //   AuthStatus,
  //   PackageNo,
  //   StatusFlag].join(';')



  // const hash = CryptoJS.HmacSHA256(message, ticket);

  // const hashString = hash.toString(CryptoJS.enc.Hex).toUpperCase()
  // console.log("message:", message)
  // console.log("hashKey:", hashString)

  // const peiraeus = request.nextUrl.searchParams.get('peiraeus')

  // redirect('/checkout/confirm/success')
  // console.log("form:",form)
  return new NextResponse(JSON.stringify(paymentData));
}