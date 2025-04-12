import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, res: NextResponse) {
  // we will use params to access the data passed to the dynamic route
  // const user = params.user;


  return new NextResponse(`
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=/checkout/order-summary" />
            <script>window.location.href = "/checkout/order-summary"</script>
          </head>
          <body>Redirecting...</body>
        </html>
      `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

export async function GET(request: NextRequest, res: NextResponse) {
  // we will use params to access the data passed to the dynamic route
  // const user = params.user;


  return new NextResponse(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/checkout/order-summary" />
          <script>window.location.href = "/checkout/order-summary"</script>
        </head>
        <body>Redirecting...</body>
      </html>
    `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}