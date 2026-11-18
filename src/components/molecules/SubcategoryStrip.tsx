// Υποκατηγορίες στην κορυφή της σελίδας κατηγορίας (2026-10-18).
// Στο κινητό είναι ο μόνος τρόπος να πας σε υποκατηγορία (το πλαϊνό μενού κρύβεται):
// οριζόντια λωρίδα που σύρεται με το δάχτυλο· στον υπολογιστή αναδιπλώνεται.
// (2026-10-23) Όλα τα πλαίσια ίδιο ύψος: το <li> τεντώνεται στη γραμμή (flex) και
// το πλαίσιο το γεμίζει (h-full) — ονόματα σε μία ή δύο γραμμές δεν αλλάζουν το ύψος.
import Link from "next/link"
import Image from "next/image"
import { FaRegImage } from "react-icons/fa"

export interface SubcategoryItem {
    name: string
    href: string
    imageUrl: string | null
}

export default function SubcategoryStrip({ items }: { items: SubcategoryItem[] }) {
    if (!items.length) return null
    return (
        <nav aria-label="Υποκατηγορίες" className="mt-4 -mx-2 sm:mx-0">
            <ul className="flex items-stretch gap-3 overflow-x-auto px-2 pb-2 snap-x sm:flex-wrap sm:justify-center sm:overflow-visible">
                {items.map(item => (
                    <li key={item.href} className="snap-start shrink-0 flex">
                        <Link
                            href={item.href}
                            className="flex h-full w-28 flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm transition hover:border-siteColors-blue hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:w-32"
                        >
                            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-50 dark:bg-slate-700">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt="" width={56} height={56} className="h-full w-full object-contain p-1" />
                                ) : (
                                    <FaRegImage className="h-6 w-6 text-siteColors-blue/60" aria-hidden="true" />
                                )}
                            </span>
                            <span className="line-clamp-2 text-xs font-medium leading-tight text-slate-700 dark:text-slate-200">
                                {item.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
