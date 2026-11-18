// app/newsletter/unsubscribe/page.tsx
// (2026-10-14) Οι σύνδεσμοι διαγραφής εξυπηρετούνται πλέον από τη σελίδα
// /email/unsubscribe — εδώ κρατάμε μόνο ανακατεύθυνση για τυχόν παλιούς συνδέσμους.
import { redirect } from 'next/navigation'

export default async function UnsubscribeRedirect(props: { searchParams: Promise<{ token?: string | string[] }> }) {
  const searchParams = await props.searchParams;
  const token = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token
  redirect(`/email/unsubscribe${token ? `?token=${encodeURIComponent(token)}` : ''}`)
}

export const dynamic = 'force-dynamic'
