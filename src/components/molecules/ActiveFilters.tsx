'use client'
// Ενεργά φίλτρα πάνω από τα προϊόντα, με ✕ για αφαίρεση και «Καθαρισμός όλων» (2026-10-18)
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { AiOutlineClose } from "react-icons/ai"
import { FilterProps } from "@/lib/interfaces/filters"
import { activeFilterChips, hrefWith, withoutChip, withoutFilters } from "@/lib/helpers/listFilters"

export default function ActiveFilters({ availableFilters }: { availableFilters: FilterProps[] }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams.toString())
    const chips = activeFilterChips(params, availableFilters)
    if (!chips.length) return null

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Ενεργά φίλτρα">
            {chips.map(chip => (
                <Link
                    key={chip.id}
                    href={hrefWith(pathname, withoutChip(params, chip))}
                    scroll={false}
                    replace
                    className="inline-flex items-center gap-1 rounded-full border border-siteColors-blue/30 bg-blue-50 px-3 py-1 text-sm text-siteColors-blue hover:bg-blue-100 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100"
                    aria-label={`Αφαίρεση φίλτρου ${chip.label}`}
                >
                    {chip.label}
                    <AiOutlineClose className="h-4 w-4" aria-hidden="true" />
                </Link>
            ))}
            {chips.length > 1 && (
                <Link
                    href={hrefWith(pathname, withoutFilters(params))}
                    scroll={false}
                    replace
                    className="px-2 py-1 text-sm font-semibold text-gray-600 underline hover:text-gray-900 dark:text-gray-300"
                >
                    Καθαρισμός όλων
                </Link>
            )}
        </div>
    )
}
