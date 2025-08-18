import { ICartItem } from "@/lib/interfaces/cart";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  code: string;
  userId?: string;
  cart?: ICartItem[]; // Replace with your Cart type
  cartTotal: number
}

interface StrapiError {
  data: object,
  error: {
    status: number,
    name: string,
    message: string,
    details: {}
  }
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body: RequestBody = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ADMIN_JWT_SECRET}`,
        },
        body: JSON.stringify({
          ...body,
          user: body.userId ? { id: body.userId } : null,
        }),
      }
    );

    if (!response.ok) {
      const errorData: StrapiError = await response.json();
      throw new Error(errorData.error.message || "Validation failed");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json(
      {
        message,
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : undefined : undefined,
      },
      { status: 500 }
    );
  }
}