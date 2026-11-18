// (2026-10-23) Σελίδα αξιολόγησης από τον σύνδεσμο του email #23
import { Metadata } from 'next'
import ReviewForm from '@/components/organisms/reviews/ReviewForm'

export default async function ReviewPage(
    props: {
        params: Promise<{ token: string }>,
        searchParams: Promise<{ optout?: string | string[] }>,
    }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const optout = (Array.isArray(searchParams.optout) ? searchParams.optout[0] : searchParams.optout) === '1'
    return (
        <div className="px-4">
            <ReviewForm token={params.token ?? ''} optout={optout} />
        </div>
    )
}

export const metadata: Metadata = {
    title: 'Αξιολόγηση προϊόντος | Magnet Market',
    // Προσωπικό token: ποτέ στις μηχανές αναζήτησης
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'
