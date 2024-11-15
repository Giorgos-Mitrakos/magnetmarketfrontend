// import { useSearchParams } from "next/navigation";

import { getTransactionTicket } from "@/lib/helpers/piraeusGateway";
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

  const ticket = await getTransactionTicket({ orderId, amount, installments })


  const peiraeus = request.nextUrl.searchParams.get('peiraeus')
  console.log(ticket)
  redirect('/checkout/confirm')
  return new Response(`Welcome to my Next application ${peiraeus}`);
}