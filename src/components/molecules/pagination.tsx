'use client'
// Σελιδοποίηση (2026-10-18): πραγματικοί σύνδεσμοι (<a href>) ώστε το Google να
// βρίσκει τα προϊόντα και μετά τη σελίδα 1· χωρίς αλλαγή σελίδας με το Tab.
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai"

function PaginationBar({ totalItems, currentPage, itemsPerPage }: { totalItems: number, currentPage: number, itemsPerPage: number }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isPageOpen, setPageOpen] = useState<boolean>(false)
    const mobileRef = useRef<HTMLDivElement>(null)

    const pageCount = Math.ceil(totalItems / itemsPerPage)

    useEffect(() => {
        if (!isPageOpen) return
        const onClick = (e: MouseEvent) => {
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setPageOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [isPageOpen])

    if (pageCount <= 1) return null

    const hrefFor = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        if (page === 1) params.delete('page')
        else params.set('page', page.toString())
        const qs = params.toString()
        return qs ? `${pathname}?${qs}` : pathname
    }

    const circle = `flex items-center justify-center w-10 h-10 text-lg font-semibold rounded-full text-siteColors-blue dark:text-slate-200`
    const hover = 'hover:text-white hover:bg-siteColors-blue dark:hover:text-slate-800 dark:hover:bg-slate-200'

    // Σελίδες γύρω από την τρέχουσα: 1 … (τρέχουσα-1) τρέχουσα (τρέχουσα+1) … τελευταία
    const minPage = Math.max(1, currentPage - 1)
    const maxPage = Math.min(pageCount, currentPage + 1)
    const list: (number | 'gapL' | 'gapR')[] = []
    if (minPage > 1) list.push(1)
    if (minPage > 2) list.push('gapL')
    for (let p = minPage; p <= maxPage; p++) list.push(p)
    if (maxPage < pageCount - 1) list.push('gapR')
    if (maxPage < pageCount) list.push(pageCount)

    return (
        <>
            <nav className="my-8 hidden sm:block" aria-label="Σελίδες">
                <ul className="flex justify-center items-center space-x-1.5">
                    {currentPage > 1 && (
                        <li>
                            <Link href={hrefFor(currentPage - 1)} rel="prev" className={`${circle} ${hover} w-8 h-8`} aria-label="Προηγούμενη σελίδα">
                                <AiOutlineLeft />
                            </Link>
                        </li>
                    )}
                    {list.map(item =>
                        typeof item === 'number' ? (
                            <li key={item}>
                                {item === currentPage ? (
                                    <span aria-current="page" className={`${circle} border border-siteColors-blue dark:border-slate-200`}>{item}</span>
                                ) : (
                                    <Link href={hrefFor(item)} className={`${circle} ${hover}`} aria-label={`Σελίδα ${item}`}>{item}</Link>
                                )}
                            </li>
                        ) : (
                            <li key={item}><span className={circle} aria-hidden="true">…</span></li>
                        )
                    )}
                    {currentPage < pageCount && (
                        <li>
                            <Link href={hrefFor(currentPage + 1)} rel="next" className={`${circle} ${hover} w-8 h-8`} aria-label="Επόμενη σελίδα">
                                <AiOutlineRight />
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>

            <nav className="my-8 flex justify-center items-center gap-2 sm:hidden" aria-label="Σελίδες">
                {currentPage > 1 ? (
                    <Link href={hrefFor(currentPage - 1)} rel="prev" className={circle} aria-label="Προηγούμενη σελίδα">
                        <AiOutlineLeft />
                    </Link>
                ) : <span className="w-10" />}

                <div ref={mobileRef} className="relative">
                    <button
                        type="button"
                        className="flex h-10 items-center rounded-full border border-siteColors-blue px-4 text-base font-semibold text-siteColors-blue dark:border-slate-200 dark:text-slate-200"
                        onClick={() => setPageOpen(o => !o)}
                        aria-expanded={isPageOpen}
                        aria-label={`Σελίδα ${currentPage} από ${pageCount} — επιλογή σελίδας`}
                    >
                        {currentPage} / {pageCount}
                    </button>
                    {isPageOpen && (
                        <ul className="absolute bottom-12 left-1/2 z-10 max-h-56 w-24 -translate-x-1/2 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-slate-200 divide-y dark:bg-slate-700 dark:ring-slate-600">
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                <li key={page}>
                                    <Link
                                        href={hrefFor(page)}
                                        onClick={() => setPageOpen(false)}
                                        className={`block px-4 py-2 text-center text-base ${page === currentPage ? 'font-bold text-siteColors-blue' : 'text-slate-700 dark:text-slate-200'}`}
                                    >
                                        {page}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {currentPage < pageCount ? (
                    <Link href={hrefFor(currentPage + 1)} rel="next" className={circle} aria-label="Επόμενη σελίδα">
                        <AiOutlineRight />
                    </Link>
                ) : <span className="w-10" />}
            </nav>
        </>
    )
}

export default PaginationBar
