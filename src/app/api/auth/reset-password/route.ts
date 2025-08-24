// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, password, passwordConfirmation } = await request.json();

    if (!code || !password || !passwordConfirmation) {
      return NextResponse.json(
        { error: { message: 'Code, password and password confirmation are required' } },
        { status: 400 }
      );
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: { message: 'Passwords do not match' } },
        { status: 400 }
      );
    }

    // Κλήση στο Strapi API για επαναφορά κωδικού
    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, password, passwordConfirmation }),
    });

    const data = await strapiResponse.json();

    if (strapiResponse.ok) {
      return NextResponse.json(
        { ok: true, message: 'Password reset successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: data.error || { message: 'Something went wrong' } },
        { status: strapiResponse.status }
      );
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}