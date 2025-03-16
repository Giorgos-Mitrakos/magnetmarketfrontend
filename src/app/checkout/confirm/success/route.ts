import { NextRequest } from "next/server";
import { redirect } from 'next/navigation'
import { sendEmail } from "@/lib/helpers/piraeusGateway";
import { title } from "process";

export async function POST(request: NextRequest) {
    console.log(request.headers.get('content-type'))
    const transactionData = await request.formData();
    console.log('Transaction data received:', transactionData);

    // Process the transaction (e.g., validate, save to database)
    // if (transactionData.status === 'success') {
    //     console.log('Transaction was successful!');
    // }
    sendEmail({ title: "Response from bank", data: request.headers.get('content-type') || "empty" })
    redirect('/checkout/thank-you')
    return new Response(JSON.stringify({ message: 'Payment processed successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}