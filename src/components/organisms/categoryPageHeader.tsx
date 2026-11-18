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
            // (2026-10-18) Η προεπιλεγμένη σειρά δεν είναι «δημοφιλή»: στις κατηγορίες είναι
            // προσφορές → διαθέσιμα → κατόπιν παραγγελίας → εξαντλημένα
            title: "ΠΡΟΤΕΙΝΟΜΕΝΑ",
            route: ""
        },
        {
            title: "ΤΙΜΗ ΑΥΞΟΥΣΑ",
            route: "price:asc"
        },
        {
            title: "ΤΙΜΗ ΦΘΙΝΟΥΣΑ",
            route: "price:desc"
        },
        {
            title: "ΑΛΦΑΒΗΤΙΚΑ Α->Ω",
            route: "name:asc"
        },
        {
            title: "ΑΛΦΑΒΗΤΙΚΑ Ω->Α",
            route: "name:desc"
        },
    ]
};

export default function CategoryPageHeader({
    totalItems,
    defaultSortLabel,
    showNewest = false,
    extraSorts = [],
}: {
    totalItems: number
    /** Τίτλος της προεπιλεγμένης ταξινόμησης (π.χ. «ΣΧΕΤΙΚΟΤΗΤΑ» στην αναζήτηση) */
    defaultSortLabel?: string
    /** Και ταξινόμηση «ΝΕΟΤΕΡΑ» (όπου την υποστηρίζει το Strapi — π.χ. κατηγορίες) */
    showNewest?: boolean
    /** (2026-10-24) Επιπλέον ταξινομήσεις αμέσως μετά την προεπιλεγμένη (π.χ. «ΜΕΓΑΛΥΤΕΡΗ ΕΚΠΤΩΣΗ» στις προσφορές) */
    extraSorts?: DropdownItem[]
}) {
    let items = itemsOrderBy.items
    if (defaultSortLabel) items = items.map((i) => (i.route === "" ? { ...i, title: defaultSortLabel } : i))
    if (showNewest) items = [...items.slice(0, 3), { title: "ΝΕΟΤΕΡΑ", route: "createdAt:desc" }, ...items.slice(3)]
    if (extraSorts.length) items = [items[0], ...extraSorts, ...items.slice(1)]
    const orderBy: DropdownFilter = { ...itemsOrderBy, items }

    return (
        <section className="grid space-y-2 sm:space-y-0 sm:grid-cols-2  
        bg-slate-300 dark:bg-slate-600 font-semibold text-sm text-slate-800
        rounded h-auto p-4 mb-8 w-full">
            <div className="flex flex-col w-full divide-y space-y-2 
            sm:divide-y-0 sm:space-y-0 sm:flex-row sm:divide-x sm:space-x-4 dark:text-slate-200">
                <span aria-label={`${totalItems} ΠΡΟΪΟΝΤΑ`}>
                    {totalItems} {totalItems === 1 ? "ΠΡΟΪΟΝ" : "ΠΡΟΪΟΝΤΑ"}
                </span>
                <div className="pt-2 sm:pt-0 sm:pl-8">
                    <Dropdown filter={itemsPerPage.filter} items={itemsPerPage.items} />
                </div>
            </div>
            <div className="flex justify-start sm:justify-end items-center dark:text-slate-200">
                <Dropdown filter={orderBy.filter} items={orderBy.items} />
            </div>
        </section>
    )
}