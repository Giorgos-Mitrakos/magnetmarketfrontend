// app/brands/[slug]/page.tsx — σελίδα κατασκευαστή
// (2026-10-27) Όλη η λογική στο components/templates/brandRoute.tsx (κοινή με τη
// σελίδα «κατηγορία + μάρκα» /brands/{brand}/{category})
import { Metadata } from 'next'
import { BrandRoute, brandRouteMetadata, type BrandSearchParams } from '@/components/templates/brandRoute'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<BrandSearchParams> }

export default async function BrandProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return <BrandRoute slug={params.slug} searchParams={searchParams} />
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return brandRouteMetadata(params.slug, null, searchParams)
}
