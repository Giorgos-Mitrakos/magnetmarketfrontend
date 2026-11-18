// (2026-10-23) Σύγκριση προϊόντων: /compare?ids=<documentId>,<documentId>,…
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/molecules/breadcrumb'
import CompareTable, { type CompareData } from '@/components/compare/CompareTable'
import { storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi'

async function getCompare(ids: string[]): Promise<CompareData | null> {
    if (!ids.length) return { products: [], rows: [] }
    try {
        return await storefrontFetch<CompareData>('/storefront/compare', { body: { documentIds: ids } })
    } catch (error) {
        if (error instanceof StorefrontApiError && error.status === 404) return null
        throw error
    }
}

export default async function ComparePage(props: { searchParams: Promise<{ ids?: string | string[] }> }) {
    const searchParams = await props.searchParams;
    const raw = Array.isArray(searchParams.ids) ? searchParams.ids.join(',') : searchParams.ids ?? ''
    const ids = raw.split(',').map(s => s.trim()).filter(s => /^[a-z0-9]{10,40}$/i.test(s)).slice(0, 4)
    const data = await getCompare(ids)
    if (!data) notFound() // η σύγκριση είναι κλειστή (Product Manager → Ρυθμίσεις)

    return (
        <div className="mx-auto max-w-screen-2xl py-6">
            <Breadcrumb breadcrumbs={[{ title: 'Αρχική', slug: '/' }, { title: 'Σύγκριση προϊόντων', slug: '/compare' }]} />
            <h1 className="mb-4 mt-4 text-2xl font-bold text-siteColors-purple dark:text-slate-100">Σύγκριση προϊόντων</h1>
            {data.products.length < 2 ? (
                <div className="rounded-xl bg-white p-6 text-slate-700 dark:bg-gray-800 dark:text-slate-200">
                    <p>Επιλέξτε τουλάχιστον δύο προϊόντα με το κουμπί <strong>«Σύγκριση»</strong> στη σελίδα τους.</p>
                    <Link href="/" className="mt-3 inline-block text-siteColors-purple underline">Συνέχεια αγορών</Link>
                </div>
            ) : (
                <CompareTable data={data} />
            )}
        </div>
    )
}

export const metadata: Metadata = {
    title: 'Σύγκριση προϊόντων | Magnet Market',
    robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'
