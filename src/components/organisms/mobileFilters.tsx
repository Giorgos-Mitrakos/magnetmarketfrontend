"use client"

// Φίλτρα στο κινητό (2026-10-18): αριθμός ενεργών φίλτρων πάνω στο κουμπί,
// «Καθαρισμός» και «Δες N προϊόντα» στο κάτω μέρος του πάνελ.
import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { FaFilter } from "react-icons/fa6"
import CategoryFilters from "./categoryFilters"
import { FilterProps } from "@/lib/interfaces/filters"
import { activeFilterChips, hrefWith, withoutFilters } from "@/lib/helpers/listFilters"
import AvailabilityFilter from "../molecules/AvailabilityFilter"

export default function MobileFilters({
    availableFilters,
    priceRange = null,
    totalItems,
    extra = null,
}: {
    availableFilters: FilterProps[]
    priceRange?: { min: number, max: number } | null
    totalItems?: number
    /** (2026-10-28) Επιπλέον περιεχόμενο στην αρχή των φίλτρων (π.χ. λίστα κατηγοριών της μάρκας) */
    extra?: ReactNode
}) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams.toString())
    const activeCount = activeFilterChips(params, availableFilters).length

    // (2026-10-28) Μετάβαση σε άλλη σελίδα (π.χ. άλλη κατηγορία) → κλείνει το πάνελ
    useEffect(() => {
        setIsFiltersOpen(false)
    }, [pathname])

    // Χωρίς κύλιση της σελίδας από πίσω όσο είναι ανοιχτό
    useEffect(() => {
        if (!isFiltersOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [isFiltersOpen])

    return (
        <div className="lg:hidden">
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Φίλτρα"
                aria-hidden={!isFiltersOpen}
                className={`fixed inset-0 z-40 flex flex-col bg-white dark:bg-slate-800 transition-transform duration-300 ${isFiltersOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-slate-600">
                    <p className="text-lg font-semibold">Φίλτρα{activeCount > 0 ? ` (${activeCount})` : ''}</p>
                    <button
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-siteColors-blue"
                        onClick={() => setIsFiltersOpen(false)}
                    >
                        Κλείσιμο
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4">
                    {extra}
                    <div className="pt-4">
                        <AvailabilityFilter showSale />
                    </div>
                    <CategoryFilters availableFilters={availableFilters} priceRange={priceRange} idPrefix="m" />
                </div>
                <div className="flex gap-3 border-t border-gray-200 p-4 dark:border-slate-600">
                    {activeCount > 0 && (
                        <Link
                            href={hrefWith(pathname, withoutFilters(params))}
                            replace
                            scroll={false}
                            className="flex-1 rounded-lg border border-gray-300 py-3 text-center text-sm font-semibold dark:border-slate-500"
                        >
                            Καθαρισμός
                        </Link>
                    )}
                    <button
                        className="flex-[2] rounded-lg bg-siteColors-blue py-3 text-sm font-semibold text-white"
                        onClick={() => setIsFiltersOpen(false)}
                    >
                        {typeof totalItems === 'number' ? `Δες ${totalItems} ${totalItems === 1 ? 'προϊόν' : 'προϊόντα'}` : 'Εφαρμογή'}
                    </button>
                </div>
            </div>
            <button id="filterButton" name="filterButton" aria-label={`Φίλτρα${activeCount ? ` (${activeCount} ενεργά)` : ''}`}
                className="fixed bottom-[calc(6rem+var(--compare-offset,0px))] right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-siteColors-lightblue shadow-xl"
                onClick={() => setIsFiltersOpen(true)}>
                <FaFilter className="h-6 w-6 text-white" />
                {activeCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-siteColors-purple px-1 text-xs font-bold text-white">
                        {activeCount}
                    </span>
                )}
            </button>
        </div>
    )
}
