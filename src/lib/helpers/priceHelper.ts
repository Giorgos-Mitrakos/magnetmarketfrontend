import { IProduct } from "../interfaces/product"

// (2026-11-23) Χωρίς τιμή (π.χ. «Ζητήστε τιμή», price = null) οι υπολογισμοί έβγαζαν NaN,
// που το React εμφάνιζε ως κείμενο «NaN» στις κάρτες. Τώρα: 0 όταν δεν υπάρχει έγκυρη τιμή.
const finite = (n: number) => (Number.isFinite(n) ? n : 0)

export function getPrices({ price, sale_price }: { price: number | null, sale_price: number | null }) {

    const basePrice = Number(price)
    const salePrice = Number(sale_price)

    const valid = Number.isFinite(basePrice) && basePrice > 0 && Number.isFinite(salePrice) && sale_price != null
    const profit = valid ? finite(basePrice - salePrice) : 0
    const discount = valid ? finite((basePrice - salePrice) * 100 / basePrice) : 0

    return { price, salePrice, profit, discount }
}