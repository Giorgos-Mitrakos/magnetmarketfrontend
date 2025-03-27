import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/checkout/thank-you", req.url), 303);
}