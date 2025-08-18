import { IPaymentMethod } from "@/lib/interfaces/shipping";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
    paymentMethod:IPaymentMethod
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

        const myHeaders = new Headers();

        myHeaders.append('Content-Type', 'application/json')

        const myInit = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body)
            // mode: "cors",
            // cache: "default",
        };


        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findPaymentCost`,
            myInit,
        )

        

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

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