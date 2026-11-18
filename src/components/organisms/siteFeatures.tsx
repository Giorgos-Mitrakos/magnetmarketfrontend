// Μπορεί να γίνει Server Component για την static δομή
import { Suspense } from 'react'
import SiteFeaturesClient from './siteFeaturesClient'

import { ISiteFeatureItem } from '@/lib/queries/homepage'

// Οι παροχές έρχονται από το admin (block «Παροχές καταστήματος»).
// Αν το backend δεν στείλει τίποτα, μένουν οι προεπιλεγμένες.
const DEFAULT_ITEMS: ISiteFeatureItem[] = [
    { id: 1, icon: 'rotate', title: 'Δωρεάν Επιστροφή', text: 'Για ελαττωματικά προϊόντα' },
    { id: 2, icon: 'creditcard', title: 'Πληρωμές με κάρτα', text: 'Ασφαλείς πληρωμές' },
    { id: 3, icon: 'comments', title: 'Τεχνική Υποστήριξη', text: '10:00 - 18:00' },
    { id: 4, icon: 'safety', title: 'Εγγύηση', text: 'Ελληνικής Αντιπροσωπείας' },
]

function toFeatures(items: ISiteFeatureItem[]) {
    return items.map(item => ({
        id: `feature-${item.id}`,
        iconType: item.icon,
        ariaLabel: item.title,
        ariaDescription: item.text ? `${item.title} ${item.text}` : item.title,
        header: item.title,
        content: item.text,
    }))
}

export interface SiteFeatureProps {
    siteFeatures: SiteFeatureProps[]
}

// Server Component Skeleton
function SiteFeaturesSkeleton() {
    return (
        <section
            aria-label="Παροχές του καταστήματος"
            className="w-full py-6 dark:bg-slate-800 dark:border-slate-700"
        >
            <div className="container mx-auto px-4">
                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="flex justify-center">
                            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm animate-pulse">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-1 w-24"></div>
                                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex space-x-4 overflow-hidden pb-2 -mx-4 px-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="w-64 flex-shrink-0">
                            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm animate-pulse">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-1 w-24"></div>
                                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Main Server Component
// Χωρίς items → οι προεπιλεγμένες. Σε server σελίδες χρησιμοποίησε το
// SiteFeaturesFromAdmin, που φέρνει τις παροχές του block της αρχικής.
export default function SiteFeatures({ items }: { items?: ISiteFeatureItem[] }) {
    const features = toFeatures(items?.length ? items : DEFAULT_ITEMS)
    return (
        <Suspense fallback={<SiteFeaturesSkeleton />}>
            <SiteFeaturesClient features={features} />
        </Suspense>
    )
}