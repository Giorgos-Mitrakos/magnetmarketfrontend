import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Κλήση του Strapi API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notify-me/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_JWT_SECRET}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Strapi API error');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}