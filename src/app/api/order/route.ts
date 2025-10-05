import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
    id: string;
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
        myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`)

        const myInit = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                id: body.id
            })
            // mode: "cors",
            // cache: "default",
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/getOrder`,
            myInit,
        )
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