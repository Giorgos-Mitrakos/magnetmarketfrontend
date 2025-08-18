import { IAddresses } from "@/lib/interfaces/addresses";
import { ICartItem } from "@/lib/interfaces/cart";
import { IShippingMethod } from "@/lib/interfaces/shipping";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
    cartItems: ICartItem[],
    addresses: IAddresses,
    shippingMethod: IShippingMethod,
    userId?: string;
}

interface StrapiError {
    message: string;
    details?: string;
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
            `${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findShippingCost`,
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
            throw new Error(errorData.message || "Application failed");
        }

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Application failed";
        return NextResponse.json(
            {
                message,
                details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : undefined : undefined,
            },
            { status: 500 }
        );
    }
}