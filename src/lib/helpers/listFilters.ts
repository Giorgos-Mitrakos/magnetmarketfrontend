// Κοινά βοηθητικά για τα φίλτρα των λιστών προϊόντων (κατηγορία κ.λπ.) — 2026-10-18
import { FilterProps } from "@/lib/interfaces/filters"

export interface ActiveFilterChip {
    /** Μοναδικό κλειδί */
    id: string
    label: string
    /** Παράμετροι της διεύθυνσης που αφαιρούνται: [όνομα, τιμή] (τιμή undefined = όλες) */
    remove: [string, string | undefined][]
}

/** Παράμετροι που ΔΕΝ είναι φίλτρα (μένουν στο «Καθαρισμός όλων») */
// (2026-10-26) + «search»: στην αναζήτηση ο «Καθαρισμός» κρατά τη λέξη που έψαξε ο πελάτης
const KEEP = new Set(['sort', 'pageSize', 'search'])

const eur = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export function activeFilterChips(params: URLSearchParams, availableFilters: FilterProps[]): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = []

    for (const filter of availableFilters ?? []) {
        for (const value of params.getAll(filter.filterBy)) {
            const v = value.toLowerCase()
            const match = filter.filterValues.find(f => (f.slug ?? f.name).toLowerCase() === v || f.name.toLowerCase() === v)
            chips.push({
                id: `${filter.filterBy}:${v}`,
                label: match?.name ?? value,
                remove: [[filter.filterBy, value]],
            })
        }
    }

    const min = params.get('price_min')
    const max = params.get('price_max')
    if (min || max) {
        const label = min && max ? `${eur(Number(min))} – ${eur(Number(max))}` : min ? `από ${eur(Number(min))}` : `έως ${eur(Number(max))}`
        chips.push({ id: 'price', label, remove: [['price_min', undefined], ['price_max', undefined]] })
    }
    if (params.get('stock') === 'true') chips.push({ id: 'stock', label: 'Άμεσα διαθέσιμα', remove: [['stock', undefined]] })
    if (params.get('sale') === 'true') chips.push({ id: 'sale', label: 'Μόνο προσφορές', remove: [['sale', undefined]] })

    return chips
}

/** Νέα διεύθυνση χωρίς το συγκεκριμένο φίλτρο (και πάντα από τη σελίδα 1) */
export function withoutChip(params: URLSearchParams, chip: ActiveFilterChip): URLSearchParams {
    const next = new URLSearchParams(params)
    for (const [key, value] of chip.remove) {
        if (value === undefined) next.delete(key)
        else {
            const rest = next.getAll(key).filter(v => v !== value)
            next.delete(key)
            rest.forEach(v => next.append(key, v))
        }
    }
    next.delete('page')
    return next
}

/** Χωρίς κανένα φίλτρο — κρατά μόνο ταξινόμηση και πλήθος ανά σελίδα */
export function withoutFilters(params: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams()
    params.forEach((value, key) => {
        if (KEEP.has(key)) next.append(key, value)
    })
    return next
}

export function hrefWith(pathname: string, params: URLSearchParams): string {
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
}
