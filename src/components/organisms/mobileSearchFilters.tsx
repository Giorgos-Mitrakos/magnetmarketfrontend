"use client"

import { useState } from "react"
import { FaFilter } from "react-icons/fa6"
import SearchFilters from "./searchFilters"

type MetadataProps = {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function MobileSearchFilters({ searchParams }: MetadataProps) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    return (
        <div>
            <div className={`fixed lg:hidden bottom-0 left-0 z-20 p-4 h-full w-full shadow-lg bg-blue-100 dark:bg-slate-600
                    transition-transform transform ${isFiltersOpen ? "translate-x-0" :
                    "-translate-x-full"} duration-500`}>
                <div className="h-full pb-16 overflow-y-auto">
                    <div className="flex flex-col">
                        <p className="uppercase text-center font-semibold text-lg">Φίλτρα</p>
                        <button className="self-end p-2 w-auto text-sm mt-4 border border-slate-200 text-slate-100 bg-siteColors-blue dark:bg-siteColors-purple rounded-lg"
                            onClick={() => setIsFiltersOpen(false)} >Κλείσιμο</button>
                    </div>
                    <SearchFilters searchParams={searchParams} />
                </div>
            </div>
            <button id="searchFilterButton" name="searchFilterButton" aria-label="Φίλτρα"
                className="fixed lg:hidden bottom-24 right-8 flex justify-center items-center rounded-full 
        bg-siteColors-lightblue h-14 w-14 shadow-xl z-30"
                onClick={() => setIsFiltersOpen(true)}>
                <FaFilter className="text-white h-6 w-6" />
            </button>
        </div>
    )
}