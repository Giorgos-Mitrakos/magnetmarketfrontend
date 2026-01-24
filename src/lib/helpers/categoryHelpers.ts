import { organizationStructuredData } from "./structureData";

type BreadcrumbType = {
    title: string
    slug: string
}

export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbType[]) {
    const breadcrumbList = breadcrumbs.map((breadcrumb, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": breadcrumb.title,
        "item": `${process.env.NEXT_URL}${breadcrumb.slug}`
    }))

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbList
    }
}

export function getCategoryScturedData(breadcrumbs: BreadcrumbType[]) {
    const structuredData = []
    structuredData.push(generateBreadcrumbStructuredData(breadcrumbs))
    structuredData.push(organizationStructuredData)
    return structuredData
}