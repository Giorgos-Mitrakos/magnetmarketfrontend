// components/atoms/carousel.tsx
//
// Οριζόντια λίστα προϊόντων (χωρίς Swiper). Server component: οι κάρτες
// έρχονται έτοιμες στο HTML, οπότε ο πελάτης (και η Google) βλέπει τα
// προϊόντα αμέσως, χωρίς skeletons και «πήδημα» της σελίδας.
// Κινητό: μία κάρτα κεντραρισμένη (76% του πλάτους: w-full μέσα στο padding), με λίγο από την
// προηγούμενη/επόμενη στις άκρες — δείχνει ότι υπάρχουν κι άλλες χωρίς θόλωμα.
// Το padding 12% αριστερά/δεξιά επιτρέπει και στην πρώτη/τελευταία να κεντραριστούν.
// Από 640px: 2 κάρτες, 768px: 3, 1024px: 4 (στοίχιση αριστερά).
// (2026-10-22) Ελάχιστο πλάτος κάρτας 18rem: σε στενότερο χώρο (π.χ. tablet
// μέσα σε πλαίσιο με padding) φαίνονται λιγότερες και η επόμενη «κόβεται»,
// αντί να γίνονται όλες στενόμακρες. Με 1–2 προϊόντα: στο κέντρο.
import ScrollRow from './ScrollRow'
import ProductCard from '@/components/organisms/productCard'
import { IProductCard } from '@/lib/interfaces/product'

interface CarouselProps {
  products: IProductCard[]
  listName?: string
  listId?: string
  arrows?: 'default' | 'light'
}

const Carousel = ({ products, listName = 'Προϊόντα', listId, arrows }: CarouselProps) => {
  if (!products || products.length === 0) return null

  return (
    <ScrollRow
      label={listName}
      arrows={arrows}
      className={`gap-3 px-[12%] sm:gap-4 sm:px-0 ${products.length <= 2 ? 'sm:justify-center' : ''}`}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="snap-center sm:snap-start shrink-0 w-full sm:w-[max(18rem,calc((100%-1rem)/2))] md:w-[max(18rem,calc((100%-2rem)/3))] lg:w-[max(18rem,calc((100%-3rem)/4))]"
        >
          <ProductCard product={product} listName={listName} listId={listId} position={index} />
        </div>
      ))}
    </ScrollRow>
  )
}

export default Carousel
