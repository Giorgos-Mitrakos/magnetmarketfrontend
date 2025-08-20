import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
    email: string;
    token: string;
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
            body: JSON.stringify({
                email: body.email,
                token: body.token
            })
            // mode: "cors",
            // cache: "default",
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/unsubscribe`,
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