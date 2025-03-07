'use client'
import Dropdown from "../molecules/dropdown";

export interface DropdownItem {
    title: string;
    route: string;
}

export interface DropdownFilter {
    filter: string,
    items: DropdownItem[]

}

const itemsPerPage: DropdownFilter = {
    filter: "pageSize",
    items: [{
        title: "12",
        route: "12"
    },
    {
        title: "24",
        route: "24"
    },
    {
        title: "48",
        route: "48"
    },
    ]
};

const itemsOrderBy: DropdownFilter =
{
    filter: "sort",
    items: [
        {
            title: "ΤΙΜΗ ΑΥΞΟΥΣΑ",
            route: "price"
        },
        {
            title: "ΤΙΜΗ ΦΘΙΝΟΥΣΑ",
            route: "price:desc"
        },
        {
            title: "ΑΛΦΑΒΗΤΙΚΑ Α->Ω",
            route: "name"
        },
        {
            title: "ΑΛΦΑΒΗΤΙΚΑ Ω->Α",
            route: "name:desc"
        },
    ]
};

export default function CategoryPageHeader({ totalItems }: { totalItems: number }) {

    return (
        <section className="grid space-y-2 sm:space-y-0 sm:grid-cols-2  
        bg-slate-300 dark:bg-slate-600 font-semibold text-sm text-slate-800
        rounded h-auto p-4 mb-8 w-full">
            <div className="flex flex-col w-full divide-y space-y-2 
            sm:divide-y-0 sm:space-y-0 sm:flex-row sm:divide-x sm:space-x-4 dark:text-slate-200">
                <span aria-label={`${totalItems} ΠΡΟΪΟΝΤΑ`}>
                    {totalItems} ΠΡΟΪΟΝΤΑ
                </span>
                <div className="pt-2 sm:pt-0 sm:pl-8">
                    <Dropdown filter={itemsPerPage.filter} items={itemsPerPage.items} />
                </div>
            </div>
            <div className="flex justify-start sm:justify-end items-center dark:text-slate-200">
                <Dropdown filter={itemsOrderBy.filter} items={itemsOrderBy.items} />
            </div>
        </section>
    )
}