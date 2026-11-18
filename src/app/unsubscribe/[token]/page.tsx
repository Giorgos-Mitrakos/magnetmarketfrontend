// app/unsubscribe/[token]/page.tsx
// (2026-10-14) Παλιός σύνδεσμος ακύρωσης ειδοποίησης διαθεσιμότητας →
// νέα σελίδα /email/alert-cancel (ίδιο site, ίδιο στυλ).
import { redirect } from 'next/navigation'

export default async function AlertUnsubscribeRedirect(props: { params: Promise<{ token: string }> }) {
    const params = await props.params;
    redirect(`/email/alert-cancel?token=${encodeURIComponent(params.token ?? '')}`)
}

export const dynamic = 'force-dynamic'
