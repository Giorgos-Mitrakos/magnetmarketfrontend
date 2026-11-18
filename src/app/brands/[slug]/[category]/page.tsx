// app/brands/[slug]/[category]/page.tsx — (2026-10-27) σελίδα «κατηγορία + μάρκα»,
// π.χ. /brands/ezviz/kameres → «Κάμερες Ezviz». Λογική: components/templates/brandRoute.tsx
import { Metadata } from 'next'
import { BrandRoute, brandRouteMetadata, type BrandSearchParams } from '@/components/templates/brandRoute'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string; category: string }>; searchParams: Promise<BrandSearchParams> }

export default async function BrandCategoryPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return <BrandRoute slug={params.slug} category={decodeURIComponent(params.category)} searchParams={searchParams} />
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return brandRouteMetadata(params.slug, decodeURIComponent(params.category), searchParams)
}
