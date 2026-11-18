// Λίστα προϊόντων της αρχικής. Τα προϊόντα έρχονται ήδη από το backend.
//  style «gradient» → η εμφάνιση της παλιάς «Λίστας προϊόντων»
//  style «header»   → η εμφάνιση του παλιού «Hot ή προσφορά» (χρωματιστή κεφαλίδα)
import ListProductsBanner from './listProductsBanner'
import HotOrSaleClient from './hotOrSaleClient'
import { IProductListBlock, TProductListColor } from '@/lib/queries/homepage'

// Το HotOrSaleClient διαλέγει χρώμα κεφαλίδας από αυτά τα κλειδιά
const HEADER_TYPE: Record<TProductListColor, string> = {
    magenta: 'hot',
    blue: 'new',
    purple: 'sale',
    orange: 'expected',
    red: 'backorder',
    navy: 'default',
}

const ProductListBlock = ({ id, title, subtitle, style, color, products, source, ends_at }: Omit<IProductListBlock, 'id' | '__component'> & { id: string }) => {
    if (!products?.length) return null
    // «Προσφορές που λήγουν»: αντίστροφη μέτρηση στην κεφαλίδα
    const endsAt = source === 'sale_ending' ? ends_at ?? null : null

    if (style === 'header') {
        return (
            <HotOrSaleClient
                id={id}
                title={title}
                type={HEADER_TYPE[color] ?? 'default'}
                initialData={products}
                endsAt={endsAt}
            />
        )
    }

    return <ListProductsBanner id={id} title={title} subtitle={subtitle ?? undefined} products={products} endsAt={endsAt} />
}

export default ProductListBlock
