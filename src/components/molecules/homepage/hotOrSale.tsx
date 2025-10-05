// Server Component - φέρνει τα data στο server
import { cache, } from 'react'
import HotOrSaleClient from './hotOrSaleClient'
import { IHomeHotOrSale } from '@/lib/queries/homepage'



// Server-side data fetching function
const getProductsData = cache(async (type: string) => {
    try {
        const myHeaders = new Headers();

        myHeaders.append('Content-Type', 'application/json')
        myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/getHotOrSale`,
            {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({ type: type }),
                next: {
                    revalidate: 10, // Χρήση της μεταβλητής cacheTime
                }
            }
        )

        const data = await response.json()
        
        return data
    } catch (err) {
        console.error("Error fetching products:", err)
        return null
    }
})

// Server Component Skeleton - ΙΔΙΑ εμφάνιση
function HotOrSaleSkeleton({ type, title }: { type: string; title: string }) {
    const getHeaderColors = () => {
        switch (type) {
            case 'hot':
                return 'bg-[#a9488e] dark:bg-gradient-to-br dark:from-[#5a2349] dark:to-[#8c3a75] text-white dark:text-slate-200'
            case 'new':
                return 'bg-[#246eb5] dark:bg-gradient-to-br dark:from-[#153a61] dark:to-[#1e5a95] text-white dark:text-slate-200'
            case 'sale':
                return 'bg-[#6e276f] dark:bg-gradient-to-br dark:from-[#3d183e] dark:to-[#5a205b] text-white dark:text-slate-200'
            default:
                return 'bg-[#24488f] dark:bg-gradient-to-br dark:from-[#132247] dark:to-[#1d3a72] text-white dark:text-slate-200'
        }
    }

    return (
        <div className="my-8">
            <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 min-h-[764px]">
                <div className={`${getHeaderColors()} py-4 px-6`}>
                    <div className="h-7 w-48 bg-white/30 rounded mx-auto animate-pulse"></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 2 }, (_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-700 rounded-lg p-4 animate-pulse">
                                <div className="aspect-square bg-gray-200 dark:bg-slate-600 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main Server Component
export default async function HotOrSale({ id, title, type }: IHomeHotOrSale) {
    // Server-side data fetching
    const data = await getProductsData(type)

    // Αν δεν υπάρχουν data, επιστρέφουμε το skeleton
    if (data === null) {
        return <HotOrSaleSkeleton type={type} title={title} />
    }

    return (
        <HotOrSaleClient
            id={id}
            title={title}
            type={type}
            initialData={data}
        />
    )
}