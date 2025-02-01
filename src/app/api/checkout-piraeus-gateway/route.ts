// import { useSearchParams } from "next/navigation";

import { getTransactionTicket } from "@/lib/helpers/piraeusGateway";
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

  console.log("responseGetTrans:", response)

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json')

  // αποθηκέυω το τικετ στην παραγγελία του πελάτη στη βαση δεδομένων
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/saveTicket`,
    {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderId: orderId,
        TransTicket: response.TransTicket
      })
    },
  )

  const form = new FormData()
  form.append('AcquirerId', '14')
  form.append('MerchantId', 'Test')
  form.append('PosId', '99999999')
  form.append('User', `${process.env.PEIRAIWS_USERNAME}`)
  form.append('LanguageCode', 'el-GR')
  form.append('MerchantReference', orderId)
  form.append('ParamBackLink', 'magnetmarket.gr/checkout/confirm/success')

  // Αποστολή δεδομένων με Fetch API 
  const respone = await fetch('https://paycenter.winbank.gr/redirection/pay/aspx', { method: 'POST', headers: { 'Content-Type': 'application/form-data' }, body: form })
  // .then(response => response)
  // .then(data => console.log('Success:', data))
  // .catch(error => console.error('Error:', error));
  console.log("response from paycenter:",await respone.text())

  // const ticket = await getTransactionTicket({ orderId, amount, installments })
  const ticket = '4236ece6142b4639925eb6f80217122f'
  const posId = '99999999'
  const AcquirerId = '14'
  const MerchantReference = 'Test'
  const ApprovalCode = '389700'
  const Parameters = 'MyParam'
  const ResponseCode = '00'
  const SupportReferenceId = '364629'
  const AuthStatus = '02'
  const PackageNo = '1'
  const StatusFlag = 'Success'

  const message = [
    ticket,
    posId,
    AcquirerId,
    MerchantReference,
    ApprovalCode,
    Parameters,
    ResponseCode,
    SupportReferenceId,
    AuthStatus,
    PackageNo,
    StatusFlag].join(';')



  const hash = CryptoJS.HmacSHA256(message, ticket);

  const hashString = hash.toString(CryptoJS.enc.Hex).toUpperCase()
  console.log("message:", message)
  console.log("hashKey:", hashString)

  const peiraeus = request.nextUrl.searchParams.get('peiraeus')

  redirect('/checkout/confirm/success')
  // return new Response(`Welcome to my Next application ${peiraeus}`);
}