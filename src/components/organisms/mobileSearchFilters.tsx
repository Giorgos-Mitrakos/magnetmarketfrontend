// components/organisms/mobileSearchFilters.tsx (Pure Server Component)
import { FaFilter } from "react-icons/fa6"
import SearchFilters from "./searchFilters"
import { FilterProps } from "@/lib/interfaces/filters"

interface MobileSearchFiltersProps {
    searchFilters: FilterProps[]
}

export default function MobileSearchFilters({ searchFilters }: MobileSearchFiltersProps) {
    return (
        <div>
            {/* Hidden checkbox για CSS-only toggle */}
            <input 
                type="checkbox" 
                id="mobile-filters-toggle" 
                className="hidden peer" 
            />
            
            {/* Filter panel */}
            <div className="fixed lg:hidden bottom-0 left-0 z-20 p-4 h-full w-full shadow-lg bg-blue-100 dark:bg-slate-600
                    transition-transform transform -translate-x-full peer-checked:translate-x-0 duration-500">
                <div className="h-full pb-16 overflow-y-auto">
                    <div className="flex flex-col">
                        <p className="uppercase text-center font-semibold text-lg">Φίλτρα</p>
                        <label 
                            htmlFor="mobile-filters-toggle"
                            className="self-end p-2 w-auto text-sm mt-4 border border-slate-200 text-slate-100 bg-siteColors-blue dark:bg-siteColors-purple rounded-lg cursor-pointer">
                            Κλείσιμο
                        </label>
                    </div>
                    <SearchFilters searchFilters={searchFilters} />
                </div>
            </div>
            
            {/* Toggle button */}
            <label 
                htmlFor="mobile-filters-toggle"
                className="fixed lg:hidden bottom-24 right-8 flex justify-center items-center rounded-full
                    bg-siteColors-lightblue h-14 w-14 shadow-xl z-30 cursor-pointer"
                aria-label="Φίλτρα">
                <FaFilter className="text-white h-6 w-6" />
            </label>
        </div>
    )
}