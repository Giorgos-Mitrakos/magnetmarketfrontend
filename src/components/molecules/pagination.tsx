'use client'
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai"

function PaginationBar({ totalItems, currentPage, itemsPerPage }: { totalItems: number, currentPage: number, itemsPerPage: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [isPageOpen, setPageOpen] = useState<boolean>(false)
    const pageCount = Math.ceil(totalItems / itemsPerPage)
    // const currentPage = Number(meta.pagination.page)
    const pages: JSX.Element[] = []
    const pagesMobile: JSX.Element[] = []

    const maxPage = Math.min(pageCount, currentPage + 1)// Math.max(currentPage + 1, 4))
    const minPage = Math.max(1, currentPage - 1)// Math.min(currentPage - 1, maxPage - 3))

    const handleItemClick = (page: number) => {
        const params = new URLSearchParams(searchParams)
        if (page === 1) {
            params.delete('page')
        }
        else {
            params.set('page', page.toString())
        }

        router.push(pathname + '?' + params)
        // router.push( {...router, query: { filter: item.title }} )//`${item.route}`)
    }

    for (let page = minPage; page <= maxPage; page++) {
        if (page === minPage && minPage > 1) {
            pages.push(
                <li key={1}>
                    <button
                        className={`flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold rounded-full 
                    ${currentPage === page ?
                                'border border-siteColors-blue' :
                                'cursor-pointer hover:text-white hover:bg-siteColors-blue'}
                    `}
                        tabIndex={0}
                        onKeyDown={() => handleItemClick(1)}
                        onClick={() => handleItemClick(1)}>
                        {1}
                    </button>
                </li>
            )
            if (minPage > 2) {
                pages.push(
                    <li key={'leftGap'}>
                        <span
                            className={`flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold rounded-full 
                        `}>
                            ...
                        </span>
                    </li>
                )
            }
        }
        pages.push(
            <li key={page}>
                <button
                    className={`flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold rounded-full 
                ${currentPage === page ?
                            'border border-siteColors-blue' :
                            'cursor-pointer hover:text-white hover:bg-siteColors-blue'}
                `}
                    tabIndex={page === 1 ? 0 : undefined}
                    onKeyDown={() => handleItemClick(page)}
                    onClick={() => handleItemClick(page)}>
                    {page}
                </button>
            </li>
        )
        if (page === maxPage && maxPage < pageCount) {
            if (pageCount > maxPage + 1) {
                pages.push(
                    <li key={'rightGap'}>
                        <span
                            className={`flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold rounded-full 
                        `}>
                            ...
                        </span>
                    </li>
                )
            }
            pages.push(
                <li key={pageCount}>
                    <button
                        className={`flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold rounded-full 
                    ${currentPage === page ?
                                'border border-siteColors-blue' :
                                'cursor-pointer hover:text-white hover:bg-siteColors-blue'}
                    `}
                        onKeyDown={() => handleItemClick(pageCount)}
                        onClick={() => handleItemClick(pageCount)}>
                        {pageCount}
                    </button>
                </li>
            )

        }
    }

    for (let page = 1; page <= pageCount; page++) {
        pagesMobile.push(
            <li key={page} className="px-4 py-2 bg-slate-50">
                <button
                    className={`flex items-center justify-center w-8 h-8 text-lg text-siteColors-blue font-semibold`}
                    tabIndex={0}
                    onKeyDown={() => handleItemClick(page)}
                    onClick={() => handleItemClick(page)}>
                    {page}
                </button>
            </li>
        )
    }

    return (
        <>
            <nav className="my-8 h-8 hidden sm:block">
                <ul className="flex justify-center space-x-1.5">
                    {currentPage > 1 && <li className="flex items-center">
                        <button className={`flex items-center justify-center w-8 h-8 text-lg text-siteColors-blue font-semibold rounded-full                 
                            cursor-pointer hover:text-white hover:bg-siteColors-blue`}
                            onKeyDown={() => handleItemClick(currentPage - 1)}
                            onClick={() => handleItemClick(currentPage - 1)}>
                            <span className="sr-only">Previous</span>
                            <AiOutlineLeft />
                        </button>
                    </li>}
                    {pages}
                    {currentPage < pageCount && <li className="flex items-center">
                        <button className={`flex items-center justify-center w-8 h-8 text-lg text-siteColors-blue font-semibold rounded-full                 
                            cursor-pointer hover:text-white hover:bg-siteColors-blue`}
                            onKeyDown={() => handleItemClick(currentPage + 1)}
                            onClick={() => handleItemClick(currentPage + 1)}>
                            <span className="sr-only">Next</span>
                            <AiOutlineRight />
                        </button>
                    </li>}
                </ul>
            </nav>
            <nav className="my-8 h-8 flex justify-center items-center sm:hidden">
                {currentPage > 1 &&
                    <button className={`flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold`}
                        onKeyDown={() => handleItemClick(currentPage - 1)}
                        onClick={() => handleItemClick(currentPage - 1)}>
                        <span className="sr-only">Previous</span>
                        <AiOutlineLeft />
                    </button>}
                <div key={currentPage}
                    className='flex relative items-center justify-center h-10 text-lg text-siteColors-blue 
                    font-semibold cursor-pointer'
                    onClick={() => setPageOpen(!isPageOpen)} aria-label={`Βρίσκεστε στη σελίδα ${currentPage}`}>
                    {currentPage}

                    <ul className={`${isPageOpen ? 'block' : 'hidden'}
                    absolute bottom-10 bg-slate-300shadow-md rounded-md
                    max-h-40 z-10 overflow-y-scroll ring-2 divide-y-2 `}>
                        {pagesMobile}
                    </ul>
                </div>

                {currentPage < pageCount &&
                    <button className='flex items-center justify-center w-10 h-10 text-lg text-siteColors-blue font-semibold'
                        onKeyDown={() => handleItemClick(currentPage + 1)}
                        onClick={() => handleItemClick(currentPage + 1)}>
                        <span className="sr-only">Next</span>
                        <AiOutlineRight />
                    </button>}
            </nav>
        </>
    )
}

export default PaginationBar