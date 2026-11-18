// Σελίδα για τους συνδέσμους των emails: /email/unsubscribe, /email/newsletter-confirm,
// /email/alert-cancel, /email/alert-renew (με ?token=…). Ο πελάτης μένει στο site.
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EmailLinkClient from '@/components/organisms/emailLinks/EmailLinkClient'
import { EMAIL_LINK_ACTIONS, EmailLinkAction } from '@/lib/helpers/emailLinks'

export default async function EmailLinkPage(
    props: {
        params: Promise<{ action: string }>,
        searchParams: Promise<{ token?: string | string[] }>,
    }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    if (!EMAIL_LINK_ACTIONS.includes(params.action as EmailLinkAction)) notFound()
    const token = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token
    return <EmailLinkClient action={params.action as EmailLinkAction} token={token ?? ''} />
}

export const metadata: Metadata = {
    title: 'Ρυθμίσεις email | Magnet Market',
    // Σελίδες με προσωπικό token: ποτέ στις μηχανές αναζήτησης
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'
