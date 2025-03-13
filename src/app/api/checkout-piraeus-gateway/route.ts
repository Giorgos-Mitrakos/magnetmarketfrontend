// import { useSearchParams } from "next/navigation";

import { getTransactionTicket, ITicketResponse, saveTicket, sendEmail } from "@/lib/helpers/piraeusGateway";
const CryptoJS = require('crypto-js');
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  // we will use params to access the data passed to the dynamic route
  // const user = params.user;

  const peiraeus = request.nextUrl.searchParams.get('peiraeus')
  console.log(request)
  redirect('/checkout/confirm')
  return new Response(`Welcome to my Next application ${peiraeus}`);
}

export async function POST(request: NextRequest) {
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
  console.log("responseGetTrans:", response)

  if (parseInt(ticketResponse.ResultCode) === 0) {
    await saveTicket({ orderId: orderId, TranTicket: ticketResponse.TranTicket })

    await sendEmail({ title: "Επίτυχημένο request", data: JSON.stringify(ticketResponse) })

    const form = new FormData()
    form.append('AcquirerId', `${process.env.ACQUIRER_ID}`)
    form.append('MerchantId', `${process.env.MERCHANT_ID}`)
    form.append('PosId', `${parseInt(`${process.env.POS_ID}`)}`)
    form.append('User', `${process.env.PEIRAIWS_USERNAME}`)
    form.append('LanguageCode', 'el-GR')
    form.append('MerchantReference', orderId)
    form.append('ParamBackLink', 'magnetmarket.gr/checkout/confirm/success')



    // Αποστολή δεδομένων με Fetch API 
    const responseFromRedirect = await fetch('https://paycenter.winbank.gr/redirection/pay/aspx', { method: 'POST', body: form })
    // .then(response => response)
    // .then(data => console.log('Success:', data))
    // .catch(error => console.error('Error:', error));


    if (responseFromRedirect.ok) {
      console.log('Η αίτηση στάλθηκε με επιτυχία!');
      await sendEmail({ title: "Η αίτηση στάλθηκε με επιτυχία!", data: JSON.stringify(responseFromRedirect.statusText) })
    } else {
      await sendEmail({ title: "Σφάλμα κατά την αίτηση:", data: JSON.stringify(responseFromRedirect.statusText) })
      console.error('Σφάλμα κατά την αίτηση:', responseFromRedirect.statusText);
    }

  }
  else {
    await sendEmail({ title: "Αποτυχημένο request", data: JSON.stringify(ticketResponse) })
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
  return new Response(`Welcome to my Next application`);
}