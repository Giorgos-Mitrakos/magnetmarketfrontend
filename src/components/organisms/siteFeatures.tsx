// Μπορεί να γίνει Server Component για την static δομή
import { Suspense } from 'react'
import SiteFeaturesClient from './siteFeaturesClient'

// Static data - μπορεί να είναι server-side
const features = [
    {
        id: 'free-return',
        iconType: 'rotate',
        ariaLabel: "Δωρεάν επιστροφή",
        ariaDescription: "Δωρεάν επιστροφή για ελαττωματικά προϊόντα",
        header: "Δωρεάν Επιστροφή",
        content: "Για ελαττωματικά προϊόντα",
    },
    {
        id: 'card-payments',
        iconType: 'creditcard',
        ariaLabel: "Πληρωμές με κάρτα",
        ariaDescription: "Ασφαλείς πληρωμές με κάρτα",
        header: "Πληρωμές με κάρτα",
        content: "Ασφαλείς πληρωμές",
    },
    {
        id: 'tech-support',
        iconType: 'comments',
        ariaLabel: "Τεχνική Υποστήριξη",
        ariaDescription: "Τεχνική Υποστήριξη 10:00 - 18:00",
        header: "Τεχνική Υποστήριξη",
        content: "10:00 - 18:00",
    },
    {
        id: 'warranty',
        iconType: 'safety',
        ariaLabel: "Εγγύηση",
        ariaDescription: "Τα προϊόντα έρχονται με εγγύηση Ελληνικής Αντιπροσωπείας",
        header: "Εγγύηση",
        content: "Ελληνικής Αντιπροσωπείας",
    }
]

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
export default function SiteFeatures() {
    return (
        <Suspense fallback={<SiteFeaturesSkeleton />}>
            <SiteFeaturesClient features={features} />
        </Suspense>
    )
}