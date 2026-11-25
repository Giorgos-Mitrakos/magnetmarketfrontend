// Κοινή λογική για τις σελίδες κατηγορίας /category/a, /category/a/b, /category/a/b/c (2026-10-18)
//
//  - Νέα κατηγορία ή νέο slug από τον Product Manager φαίνεται αμέσως (χωρίς νέο build).
//  - Κατηγορία που δεν υπάρχει → σελίδα «δεν βρέθηκε» (όχι σφάλμα 500).
//  - Αν η διεύθυνση δεν ταιριάζει με την πραγματική θέση της κατηγορίας (π.χ. άλλαξε
//    γονική), γίνεται μόνιμη ανακατεύθυνση στη σωστή.
//  - SEO από τον Product Manager (meta title / description / robots / εικόνα) με
//    αυτόματες προεπιλογές· οι φιλτραρισμένες/ταξινομημένες διευθύνσεις δεν μπαίνουν στο Google.
import { notFound, permanentRedirect } from "next/navigation"
import { Metadata } from "next"
import CategoryPageTemplate from "@/components/templates/categoryPage"
import { getCategoriesMapping, getCategoryMetadata, getCategoryProducts, ICategoryMetadata } from "@/lib/queries/categoryQuery"
import { generateCategoryStructuredData } from "@/lib/helpers/structuredDataHelpers"
import { getStrapiMedia } from "@/repositories/medias"
import { jsonLd } from '@/lib/helpers/jsonLd'

export type CategorySearchParams = { [key: string]: string | string[] }

/** Η πραγματική διαδρομή της κατηγορίας (γονικές → η ίδια) */
function canonicalSegments(meta: ICategoryMetadata): string[] {
    return [meta.parent?.parent?.slug, meta.parent?.slug, meta.slug].filter((s): s is string => !!s)
}

function queryString(searchParams: CategorySearchParams): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
        for (const v of Array.isArray(value) ? value : [value]) if (v != null) params.append(key, v)
    }
    const qs = params.toString()
    return qs ? `?${qs}` : ''
}

/** Υπάρχουν φίλτρα / ταξινόμηση; (μόνο το «page» δεν μετράει) */
function hasListParams(searchParams: CategorySearchParams): boolean {
    return Object.keys(searchParams).some((k) => k !== 'page')
}

// (2026-10-26) Αυτόματη περιγραφή χωρίς γενικούς ισχυρισμούς («καλύτερες τιμές» κ.λπ.):
// πόσα προϊόντα έχει η κατηγορία και ποιες υποκατηγορίες
function defaultDescription(meta: ICategoryMetadata, total?: number | null): string {
    const count = total && total > 0 ? `${total} ${total === 1 ? 'προϊόν' : 'προϊόντα'} ` : ''
    const subs = meta.categories?.length > 0
        ? ` Κατηγορίες: ${meta.categories.slice(0, 6).map(c => c.name).join(', ')}${meta.categories.length > 6 ? ' κ.ά.' : ''}.`
        : ''
    return `${count ? `${count}στην κατηγορία ${meta.name}` : meta.name} στο Magnet Market.${subs} Διαθεσιμότητα και χρόνος παράδοσης σε κάθε προϊόν.`
}

/** Περιγραφή για το Google: SEO → περιγραφή κατηγορίας (έως 160 χαρ.) → αυτόματη */
function seoDescription(meta: ICategoryMetadata, total?: number | null): string {
    const fromSeo = meta.seo?.metaDescription?.trim()
    if (fromSeo) return fromSeo
    const own = meta.description?.replace(/\s+/g, ' ').trim()
    if (own) return own.length > 160 ? `${own.slice(0, 157).replace(/\s+\S*$/, '')}…` : own
    return defaultDescription(meta, total)
}

async function load(path: string[]) {
    const slug = path[path.length - 1]
    const meta = await getCategoryMetadata(slug)
    if (!meta) notFound()
    const segments = canonicalSegments(meta)
    return { meta, segments, slug }
}

export async function CategoryRoute({ path, searchParams }: { path: string[], searchParams: CategorySearchParams }) {
    const { meta, segments, slug } = await load(path)

    if (segments.join('/') !== path.join('/')) {
        permanentRedirect(`/category/${segments.join('/')}${queryString(searchParams)}`)
    }

    const response = await getCategoryProducts(segments[0], slug, searchParams)
    if (!response) notFound()

    const currentPage = Number(searchParams.page) || 1
    // (2026-10-26) Σελίδα μετά την τελευταία (π.χ. παλιός σύνδεσμος ?page=40) → 404, όχι κενή λίστα
    if (currentPage > 1 && currentPage > response.meta.pagination.pageCount) notFound()
    const baseUrl = `${process.env.NEXT_URL}/category/${segments.join('/')}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl

    const mainStructuredData = generateCategoryStructuredData({
        breadcrumbs: response.breadcrumbs,
        categoryName: meta.name,
        categoryDescription: seoDescription(meta, response.meta.pagination.total),
        products: response.products,
        pageSize: response.meta.pagination.pageSize,
        currentPage,
        totalPages: response.meta.pagination.pageCount,
        baseUrl: fullUrl,
    })
    // (2026-10-27) Σύνδεσμοι προς τις σελίδες «κατηγορία + μάρκα» (μόνο όσες μπαίνουν στη Google: ≥ 3 προϊόντα)
    const brandLinks = hasListParams(searchParams)
        ? []
        : (response.availableFilters.find((f) => f.filterBy === 'brands')?.filterValues ?? [])
            .filter((b) => b.slug && b.numberOfItems >= 3)
            .sort((a, b) => b.numberOfItems - a.numberOfItems)
            .slice(0, 16)
            .map((b) => ({ name: `${meta.name} ${b.name}`, href: `/brands/${b.slug}/${meta.slug}`, count: b.numberOfItems }))

    // (2026-11-25) Η Google δέχεται ΜΙΑ λίστα (ItemList) ανά σελίδα — με δεύτερη έβγαζε σφάλμα «Έχουν καθοριστεί πολλά στοιχεία ListItem στη σελίδα» (Rich Results).
    // Μένει μόνο η λίστα προϊόντων (μέσα στο mainStructuredData)· οι υποκατηγορίες φαίνονται ως σύνδεσμοι στη σελίδα.
    const structuredData = [mainStructuredData]

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(structuredData)}}
                suppressHydrationWarning
            />
            <CategoryPageTemplate
                category1={segments[0]}
                category2={segments[1] ?? null}
                category3={segments[2] ?? null}
                title={meta.name}
                description={meta.description}
                subcategories={(meta.categories ?? []).map(c => ({
                    name: c.name,
                    href: `/category/${[...segments, c.slug].join('/')}`,
                    imageUrl: c.image ? getStrapiMedia(c.image.formats?.thumbnail?.url ?? c.image.url) : null,
                }))}
                availableFilters={response.availableFilters}
                priceRange={response.priceRange}
                products={response.products}
                meta={response.meta}
                sideMenu={response.sideMenu}
                breadcrumbs={response.breadcrumbs}
                brandLinks={brandLinks}
            />
        </>
    )
}

export async function categoryRouteMetadata(path: string[], searchParams: CategorySearchParams): Promise<Metadata> {
    const slug = path[path.length - 1]
    const meta = await getCategoryMetadata(slug)
    if (!meta) return { title: 'Η κατηγορία δεν βρέθηκε | Magnet Market', robots: { index: false, follow: true } }

    const segments = canonicalSegments(meta)
    const currentPage = Number(searchParams.page) || 1
    const baseUrl = `${process.env.NEXT_URL}/category/${segments.join('/')}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl

    const baseTitle = meta.seo?.metaTitle?.trim() || meta.name
    const title = currentPage > 1 ? `${baseTitle} - Σελίδα ${currentPage} | Magnet Market` : `${baseTitle} | Magnet Market`
    // Σελίδες για το rel prev/next και πλήθος για την περιγραφή (ίδιο αίτημα με τη σελίδα, από το cache)
    const products = await getCategoryProducts(segments[0], slug, searchParams)
    const pageCount = products?.meta.pagination.pageCount ?? 1
    const description = seoDescription(meta, products?.meta.pagination.total)

    // Robots: noindex αν ζητήθηκε από τον Product Manager ή αν υπάρχουν φίλτρα/ταξινόμηση
    const robotsText = (meta.seo?.metaRobots ?? '').toLowerCase()
    const index = !robotsText.includes('noindex') && !hasListParams(searchParams)
    const follow = !robotsText.includes('nofollow')

    const metadata: Metadata = {
        title,
        description,
        category: meta.name,
        keywords: meta.seo?.keywords || undefined,
        robots: {
            index,
            follow,
            googleBot: { index, follow, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
        alternates: {
            canonical: meta.seo?.canonicalURL?.trim() || fullUrl,
            ...(currentPage > 1 && {
                // @ts-ignore - prev is valid
                prev: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
            }),
            ...(currentPage < pageCount && {
                // @ts-ignore - next is valid
                next: `${baseUrl}?page=${currentPage + 1}`,
            }),
        },
    }

    const image = meta.seo?.metaImage ?? meta.image
    const imageUrl = image ? getStrapiMedia(image.url) : null
    metadata.openGraph = {
        url: fullUrl,
        type: 'website',
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
        siteName: "Magnet Market",
        locale: 'el_GR',
    }
    metadata.twitter = {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
    }
    return metadata
}

/** Για προ-κατασκευή των υπαρχουσών κατηγοριών στο build (οι νέες φτιάχνονται όταν ζητηθούν) */
export async function categoryStaticParams(level: 1 | 2 | 3) {
    try {
        const tree = await getCategoriesMapping()
        const out: Record<string, string>[] = []
        for (const c1 of tree) {
            if (level === 1) out.push({ category1: c1.slug })
            for (const c2 of c1.categories ?? []) {
                if (level === 2) out.push({ category1: c1.slug, category2: c2.slug })
                for (const c3 of c2.categories ?? []) {
                    if (level === 3) out.push({ category1: c1.slug, category2: c2.slug, category3: c3.slug })
                }
            }
        }
        return out
    } catch {
        // Strapi εκτός λειτουργίας στο build → οι σελίδες φτιάχνονται όταν ζητηθούν
        return []
    }
}
