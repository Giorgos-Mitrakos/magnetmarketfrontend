// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: { message: 'Email is required' } },
        { status: 400 }
      );
    }

    // Κλήση στο Strapi API για αίτημα επαναφοράς κωδικού
    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await strapiResponse.json();

    if (strapiResponse.ok) {
      return NextResponse.json(
        { ok: true, message: 'Reset email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: data.error || { message: 'Something went wrong' } },
        { status: strapiResponse.status }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}