// app/category/[category1]/[category2]/[category3]/page.tsx
// (2026-10-18) Όλη η λογική στο components/templates/categoryRoute.tsx (κοινή για τα 3 επίπεδα)
import { CategoryRoute, categoryRouteMetadata, CategorySearchParams } from "@/components/templates/categoryRoute"
import { Metadata } from 'next'

// (2026-11-01) Πάντα δυναμική (τα φίλτρα έρχονται από τα searchParams): χωρίς αυτό, μια κατηγορία
// που δεν υπήρχε τη στιγμή του build (π.χ. μετά τη μεταφορά) έβγαζε 500 (DYNAMIC_SERVER_USAGE).
export const dynamic = 'force-dynamic'

type PageProps = {
    params: Promise<{ category1: string, category2: string, category3: string }>
    searchParams: Promise<CategorySearchParams>
}

export default async function Category3Page(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    return <CategoryRoute path={[params.category1, params.category2, params.category3]} searchParams={searchParams} />
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const params = await props.params;
    return categoryRouteMetadata([params.category1, params.category2, params.category3], searchParams)
}
