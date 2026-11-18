// components/atoms/productCardBadges.tsx
//
// Badges πάνω στη φωτογραφία της κάρτας προϊόντος. Χωρίς JavaScript στον
// browser — μόνο HTML/CSS.
//  - Πάνω αριστερά (έως 2): τα badges του admin (Strapi → Badges, με τα
//    χρώματα/εικονίδιο που ορίστηκαν εκεί, π.χ. «🔥 Hot») και το αυτόματο
//    «Νέο» (το υπολογίζει το Strapi από την ημερομηνία δημιουργίας).
//  - Κάτω αριστερά: «Τελευταία N τεμάχια», όταν το πραγματικό απόθεμα της
//    αποθήκης είναι από 1 έως LOW_STOCK_MAX.
// Η έκπτωση δεν είναι εδώ — τη δείχνει η κεφαλίδα της κάρτας.
import { IProductBadge, IProductCard } from '@/lib/interfaces/product'

/** Μέχρι πόσα τεμάχια εμφανίζεται το «Τελευταία τεμάχια» */
export const LOW_STOCK_MAX = 3
/** Μέγιστος αριθμός badges πάνω αριστερά */
const MAX_TOP_BADGES = 2

const NEW_BADGE: IProductBadge = { name: 'Νέο', slug: 'new', color: '#059669', text_color: '#FFFFFF', icon: null }
const DEFAULT_COLOR = '#a9488e'

/** Δεχόμαστε μόνο hex χρώματα από το admin (#RGB, #RRGGBB κ.λπ.) */
function safeColor(value: string | null | undefined, fallback: string) {
    return value && /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim()) ? value.trim() : fallback
}

function Badge({ badge }: { badge: IProductBadge }) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide shadow-sm"
            style={{
                backgroundColor: safeColor(badge.color, DEFAULT_COLOR),
                color: safeColor(badge.text_color, '#FFFFFF'),
            }}
        >
            {badge.icon && <span aria-hidden="true">{badge.icon}</span>}
            {badge.name}
        </span>
    )
}

export default function ProductCardBadges({ product }: { product: IProductCard }) {
    // Badges του admin (χωρίς το «new» — αυτό μπαίνει μία φορά παρακάτω)
    const top: IProductBadge[] = (product.badges ?? []).filter(b => b.slug !== 'new')
    if (product.is_new) top.push(NEW_BADGE)
    const shown = top.slice(0, MAX_TOP_BADGES)

    const canBuy = !['AskForPrice', 'OutOfStock', 'Discontinued'].includes(product.status)
    const stock = Number(product.inventory) || 0
    const lowStock = canBuy && product.is_in_house && stock >= 1 && stock <= LOW_STOCK_MAX

    if (!shown.length && !lowStock) return null

    return (
        <>
            {shown.length > 0 && (
                <div className="pointer-events-none absolute top-2 left-2 z-[1] flex flex-col items-start gap-1">
                    {shown.map(b => <Badge key={b.slug} badge={b} />)}
                </div>
            )}
            {lowStock && (
                <div className="pointer-events-none absolute bottom-2 left-2 z-[1]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                        {stock === 1 ? 'Τελευταίο τεμάχιο' : `Τελευταία ${stock} τεμάχια`}
                    </span>
                </div>
            )}
        </>
    )
}
