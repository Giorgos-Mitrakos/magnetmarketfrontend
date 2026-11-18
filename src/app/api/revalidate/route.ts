// app/api/revalidate/route.ts
//
// Webhook του Strapi (Settings → Webhooks) για άμεση ανανέωση του site όταν
// αλλάζει κάτι στο admin. Header: x-revalidate-secret = REVALIDATE_SECRET.
// Αγνοεί ό,τι δεν αφορά περιεχόμενο (π.χ. προϊόντα που αλλάζουν συνέχεια από τα imports).
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const TAGS_BY_MODEL: Record<string, string[]> = {
    homepage: ['homepage'],
    page: ['pages'],
    footer: ['footer'],
    announcement: ['announcement'],
    // Οι κατηγορίες / brands / badges εμφανίζονται και σε blocks της αρχικής
    category: ['homepage', 'menu'],
    brand: ['homepage'],
    badge: ['homepage'],
}

export async function POST(req: NextRequest) {
    const secret = process.env.REVALIDATE_SECRET?.trim()
    if (!secret) {
        // Το Next.js δεν βλέπει τη μεταβλητή: λείπει από το .env.local ή δεν έγινε restart
        return NextResponse.json(
            { ok: false, message: 'Δεν έχει οριστεί REVALIDATE_SECRET στο Next.js (.env.local + restart)' },
            { status: 500 }
        )
    }
    const received = req.headers.get('x-revalidate-secret')?.trim()
    if (!received) {
        return NextResponse.json(
            { ok: false, message: 'Λείπει το header x-revalidate-secret από το webhook' },
            { status: 401 }
        )
    }
    if (received !== secret) {
        return NextResponse.json(
            { ok: false, message: 'Το x-revalidate-secret του webhook δεν ταιριάζει με το REVALIDATE_SECRET' },
            { status: 401 }
        )
    }

    let model = ''
    try {
        const body = await req.json()
        model = String(body?.model ?? '')
    } catch {
        return NextResponse.json({ ok: false, message: 'Μη έγκυρο σώμα αιτήματος' }, { status: 400 })
    }

    const tags = TAGS_BY_MODEL[model] ?? []
    // (2026-10-28) Next.js 16: { expire: 0 } = όπως πριν, η επόμενη επίσκεψη φέρνει αμέσως
    // τα νέα δεδομένα (το 'max' θα έδειχνε μία φορά ακόμη τα παλιά, όσο ανανεώνονται)
    tags.forEach(tag => revalidateTag(tag, { expire: 0 }))

    return NextResponse.json({ ok: true, model, revalidated: tags })
}
