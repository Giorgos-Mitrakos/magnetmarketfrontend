// (2026-11-25) Αναφορές του Content-Security-Policy σε λειτουργία «μόνο αναφορά».
// Ο browser κάθε επισκέπτη στέλνει εδώ ό,τι ΘΑ μπλόκαρε το CSP (δεν μπλοκάρει τίποτα).
// Κρατάμε ΜΙΑ γραμμή για κάθε διαφορετικό συνδυασμό «κανόνας + διεύθυνση» στο αρχείο
// csp-reports.log, στον φάκελο της εφαρμογής (δεν σερβίρεται δημόσια· δεν μπαίνει στο git).
// Μετά από ~2 εβδομάδες: ό,τι είναι νόμιμο προστίθεται στη λίστα του next.config.js και
// το CSP ενεργοποιείται κανονικά (Content-Security-Policy αντί για …-Report-Only).
import { NextResponse } from 'next/server'
import { appendFile, stat } from 'fs/promises'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'csp-reports.log')
const MAX_BYTES = 1024 * 1024 // πάνω από 1 MB σταματά η καταγραφή (προστασία από κατάχρηση)
const seen = new Set<string>()

type Violation = { directive: string; blocked: string; page: string }

// Παλιά μορφή (report-uri): { "csp-report": {...} } · νέα (Reporting API): [{ type, body: {...} }]
function extract(payload: unknown): Violation[] {
    const items: Record<string, unknown>[] = []
    if (Array.isArray(payload)) {
        for (const r of payload) {
            const body = (r as { body?: Record<string, unknown> })?.body
            if (body) items.push(body)
        }
    } else if (payload && typeof payload === 'object') {
        const r = (payload as Record<string, unknown>)['csp-report']
        if (r && typeof r === 'object') items.push(r as Record<string, unknown>)
    }
    return items.map((r) => {
        const directive = String(r['effective-directive'] ?? r['effectiveDirective'] ?? r['violated-directive'] ?? '').split(' ')[0]
        const rawBlocked = String(r['blocked-uri'] ?? r['blockedURL'] ?? '')
        const rawPage = String(r['document-uri'] ?? r['documentURL'] ?? '')
        let blocked = rawBlocked
        try {
            // Κρατάμε μόνο τη διεύθυνση (origin), όχι ολόκληρο το URL — αυτό χρειάζεται η λίστα
            if (/^https?:/i.test(rawBlocked)) blocked = new URL(rawBlocked).origin
        } catch { /* αφήνουμε ό,τι ήρθε (π.χ. inline, eval, data) */ }
        let page = ''
        try { page = new URL(rawPage).pathname } catch { /* — */ }
        return { directive, blocked, page }
    })
}

export async function POST(request: Request) {
    try {
        const payload = JSON.parse(await request.text())
        for (const v of extract(payload)) {
            if (!v.directive || !v.blocked) continue
            // Επεκτάσεις browser των επισκεπτών — όχι δικό μας θέμα
            if (/^(chrome|moz|safari|ms-browser)-extension/i.test(v.blocked)) continue
            const key = `${v.directive} ${v.blocked}`
            if (seen.has(key)) continue
            if (seen.size > 2000) continue
            seen.add(key)
            const size = await stat(LOG_FILE).then((s) => s.size).catch(() => 0)
            if (size > MAX_BYTES) continue
            const line = `${new Date().toISOString()}\t${v.directive}\t${v.blocked}\t${v.page}\n`
            await appendFile(LOG_FILE, line, 'utf8')
        }
    } catch {
        // Άκυρη αναφορά — αγνοείται
    }
    return new NextResponse(null, { status: 204 })
}
