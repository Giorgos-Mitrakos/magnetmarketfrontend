'use client'
// Όταν τα φίλτρα δεν φέρνουν κανένα προϊόν (2026-10-18)
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { hrefWith, withoutFilters } from "@/lib/helpers/listFilters"

export default function EmptyResults() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const filtered = Array.from(searchParams.keys()).some(k => !['sort', 'pageSize', 'page'].includes(k))

    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-12 text-center dark:border-slate-600">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {filtered ? 'Κανένα προϊόν με αυτά τα φίλτρα' : 'Δεν υπάρχουν προϊόντα σε αυτή την κατηγορία'}
            </p>
            {filtered ? (
                <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Δοκίμασε να αφαιρέσεις κάποια από τις επιλογές σου.</p>
                    <Link
                        href={hrefWith(pathname, withoutFilters(new URLSearchParams(searchParams.toString())))}
                        scroll={false}
                        className="rounded-lg bg-siteColors-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        Καθαρισμός φίλτρων
                    </Link>
                </>
            ) : (
                <Link href="/" className="text-sm font-semibold text-siteColors-blue hover:underline">
                    Πίσω στην αρχική
                </Link>
            )}
        </div>
    )
}
