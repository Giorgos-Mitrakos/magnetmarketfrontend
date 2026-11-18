'use client'
// components/atoms/ScrollRow.tsx
//
// Οριζόντια λίστα με κύλιση μόνο σε CSS (scroll-snap) — αντικαθιστά το Swiper.
// Ότι υπάρχουν κι άλλα στοιχεία φαίνεται με τρεις τρόπους:
//  - στο κινητό φαίνεται λίγο από το επόμενο (και το προηγούμενο) στοιχείο,
//    χωρίς θόλωμα. Από tablet και πάνω η άκρη «σβήνει» σταδιακά (fade) από
//    την πλευρά που συνεχίζει,
//  - βελάκια (υπολογιστής), πάντα ορατά όσο υπάρχει συνέχεια,
//  - μπάρα προόδου κάτω από τη γραμμή (κυρίως για το κινητό).
// Τα παιδιά (κάρτες) έρχονται έτοιμα από τον server — εδώ τρέχει μόνο η
// λογική των ενδείξεων (~1KB JS).
import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

interface ScrollRowProps {
    children: ReactNode
    /** Περιγραφή για αναγνώστες οθόνης, π.χ. «Προσφορές» */
    label?: string
    /** Επιπλέον κλάσεις για τη γραμμή (π.χ. gap) */
    className?: string
    /** Στυλ βελών: «light» σε σκούρο φόντο, «default» σε λευκό */
    arrows?: 'default' | 'light'
}

export default function ScrollRow({ children, label, className = 'gap-4', arrows = 'default' }: ScrollRowProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [canPrev, setCanPrev] = useState(false)
    const [canNext, setCanNext] = useState(false)
    // Μπάρα προόδου: πλάτος (ορατό ποσοστό) και θέση (0–1)
    const [thumb, setThumb] = useState({ size: 1, pos: 0 })

    const update = useCallback(() => {
        const el = ref.current
        if (!el) return
        setCanPrev(el.scrollLeft > 4)
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
        const max = el.scrollWidth - el.clientWidth
        setThumb({
            size: el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1,
            pos: max > 0 ? el.scrollLeft / max : 0,
        })
    }, [])

    useEffect(() => {
        const el = ref.current
        if (!el) return
        update()
        el.addEventListener('scroll', update, { passive: true })
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => {
            el.removeEventListener('scroll', update)
            ro.disconnect()
        }
    }, [update])

    const scrollBy = (dir: 1 | -1) => {
        const el = ref.current
        if (!el) return
        // Μία «σελίδα» κάθε φορά (λίγο λιγότερο, ώστε να φαίνεται η συνέχεια)
        el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
    }

    // Fade στις άκρες μόνο από την πλευρά που υπάρχει συνέχεια (δουλεύει σε
    // οποιοδήποτε φόντο, και σε gradient). Μόνο από tablet και πάνω (md:) —
    // στο κινητό θα θόλωνε την κάρτα που διαβάζει ο πελάτης.
    const fade = 48
    const maskImage = `linear-gradient(to right, ${canPrev ? 'transparent' : '#000'} 0, #000 ${canPrev ? fade : 0}px, #000 calc(100% - ${canNext ? fade : 0}px), ${canNext ? 'transparent' : '#000'} 100%)`
    const hasOverflow = canPrev || canNext
    const light = arrows === 'light'

    const btn = arrows === 'light'
        ? 'bg-white/90 text-gray-800 hover:bg-white'
        : 'bg-white text-gray-800 hover:bg-siteColors-purple hover:text-white dark:bg-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-600'

    return (
        <div className="relative group/row">
            <div
                ref={ref}
                role="region"
                aria-label={label}
                className={`flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:[mask-image:var(--sr-mask)] md:[-webkit-mask-image:var(--sr-mask)] ${className}`}
                style={{ '--sr-mask': maskImage } as CSSProperties}
            >
                {children}
            </div>

            <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Προηγούμενα"
                tabIndex={canPrev ? 0 : -1}
                className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 z-10 w-11 h-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${btn} ${canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <HiChevronLeft className="text-xl" />
            </button>
            <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Επόμενα"
                tabIndex={canNext ? 0 : -1}
                className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 z-10 w-11 h-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${btn} ${canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <HiChevronRight className="text-xl" />
            </button>

            {hasOverflow && (
                <div aria-hidden="true" className={`mx-auto mt-3 h-1 w-24 sm:w-32 rounded-full overflow-hidden ${light ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-600'}`}>
                    <div
                        className={`h-full rounded-full ${light ? 'bg-white' : 'bg-siteColors-purple dark:bg-slate-300'}`}
                        style={{
                            width: `${thumb.size * 100}%`,
                            transform: `translateX(${thumb.pos * (1 / thumb.size - 1) * 100}%)`,
                        }}
                    />
                </div>
            )}
        </div>
    )
}
