import { organizationStructuredData } from "@/lib/helpers/structureData"
import Script from "next/script"
import CartComp from "@/components/organisms/shoping-cartComp"

export default function Cart() {
    const breadcrumbs = [
        {
            title: "Home",
            slug: "/"
        },
        {
            title: "Καλάθι",
            slug: `/shopping-cart`
        }
    ]

    const BreadcrumbList = breadcrumbs.map((breabcrumb, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": breabcrumb.title,
            "item": `${process.env.NEXT_URL}${breabcrumb.slug}`
        }))
    
        const BreadcrumbStructuredData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": BreadcrumbList
        }
    
        const structuredData = []
        structuredData.push(BreadcrumbStructuredData)
        structuredData.push(organizationStructuredData)

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <CartComp />
        </>
    )
}