"use client"

// Πεδίο αναζήτησης με προτάσεις όσο πληκτρολογεί ο πελάτης (προϊόντα +
// κατηγορίες, από το Strapi — χωρίς τόνους, greeklish, μικρά λάθη).
// Πληκτρολόγιο: ↑/↓ επιλογή, Enter άνοιγμα (ή αναζήτηση), Esc κλείσιμο.
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa6";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useRouter } from "next/navigation";
import { getStrapiMedia } from "@/repositories/medias";

interface SuggestProduct {
    id: number
    name: string
    slug: string
    image: { url: string; formats?: { thumbnail?: { url: string } } | null } | null
    price: number | null
    sale_price: number | null
}
interface SuggestCategory {
    name: string
    link: string
}
type Option = { kind: 'category'; href: string; label: string } | { kind: 'product'; href: string; p: SuggestProduct } | { kind: 'all'; href: string; label: string }

const money = (n: number) => n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'

function SearchInput() {
    const router = useRouter();
    const listId = useId();
    const { text, setText, isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition()
    const [products, setProducts] = useState<SuggestProduct[]>([])
    const [categories, setCategories] = useState<SuggestCategory[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const lastQuery = useRef('')

    const term = (text ?? '').trim()

    // Προτάσεις με καθυστέρηση 250ms (όχι αίτημα σε κάθε πλήκτρο)
    useEffect(() => {
        if (term.length < 2) {
            setProducts([])
            setCategories([])
            return
        }
        const ctrl = new AbortController()
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
                if (!res.ok) return
                const data = await res.json()
                lastQuery.current = term
                setProducts(data?.products ?? [])
                setCategories(data?.categories ?? [])
                setActive(-1)
            } catch {
                // σιωπηλά
            }
        }, 250)
        return () => {
            clearTimeout(t)
            ctrl.abort()
        }
    }, [term])

    const options: Option[] = term.length >= 2 && (products.length || categories.length)
        ? [
            ...categories.map((c): Option => ({ kind: 'category', href: c.link, label: c.name })),
            ...products.map((p): Option => ({ kind: 'product', href: `/product/${p.slug}`, p })),
            { kind: 'all', href: `/search?search=${encodeURIComponent(term)}`, label: `Όλα τα αποτελέσματα για «${term}»` },
        ]
        : []
    const showList = open && options.length > 0

    const go = (href: string) => {
        setOpen(false)
        setText("")
        router.push(href)
    }

    const submit = () => {
        if (!term) return
        go(`/search?search=${encodeURIComponent(term)}`)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showList) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((i) => (i + 1) % options.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) => (i <= 0 ? options.length - 1 : i - 1))
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault()
            go(options[active].href)
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const handleMic = (e: React.MouseEvent<HTMLButtonElement>) => {
        isListening ? stopListening(e) : startListening(e)
    };

    const handleMicKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter") event.preventDefault();
    };

    return (
        <div className="relative flex p-2 place-self-center border-b-2 border-siteColors-purple items-center w-full lg:w-1/2 
         dark:lg:text-slate-800 rounded-sm bg-inherit dark:bg-slate-200">
            {hasRecognitionSupport &&
                <button onClick={handleMic} onKeyDown={handleMicKeyDown}
                    className="flex text-siteColors-purple dark:text-slate-200 text-lg xs:text-xl md:text-2xl"
                    aria-label="Ενεργοποίηση φωνητικής αναζήτησης"
                >
                    {isListening ?
                        <FaMicrophone
                            aria-label="Φωνητική αναζήτηση - Αναζητήστε ανά προϊόν, κατασκευαστή ή κατηγορία με φωνητικές εντολές!"
                            className='text-red-600 text-2xl mb-1 ' /> :
                        <FaMicrophoneSlash
                            className='text-siteColors-purple dark:text-slate-800 text-2xl mb-1' />}
                </button>}
            <form onSubmit={(e) => {
                e.preventDefault()
                submit()
            }}
                className="flex w-full justify-between"
                role="search"
                aria-label="Αναζήτηση">

                <input type="search" tabIndex={0} placeholder="Αναζήτηση" value={text}
                    onChange={(e) => { setText(e.target.value); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setOpen(false)}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                    autoComplete="off"
                    className="pl-2 bg-inherit  dark:text-slate-900 outline-none border-none flex-grow"
                    aria-label="Πεδίο αναζήτησης προϊόντων" />
                <button type="submit"
                    aria-label="Αναζήτηση - Αναζητήστε ανά προϊόν, κατασκευαστή ή κατηγορία">
                    <AiOutlineSearch
                        aria-label="Κουμπί αναζήτησης"
                        className="text-3xl text-siteColors-purple dark:text-slate-800" />
                </button>
            </form>

            {showList && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label="Προτάσεις αναζήτησης"
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    // Το κλικ γίνεται πριν το blur του πεδίου
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {options.map((o, i) => {
                        const isActive = i === active
                        const base = `flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${isActive ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'}`
                        if (o.kind === 'category') {
                            return (
                                <li key={`c-${o.href}`} id={`${listId}-${i}`} role="option" aria-selected={isActive} className={base} onClick={() => go(o.href)}>
                                    <span className="rounded bg-siteColors-lightblue/15 px-2 py-0.5 text-xs font-semibold text-siteColors-blue">Κατηγορία</span>
                                    <span className="font-medium">{o.label}</span>
                                </li>
                            )
                        }
                        if (o.kind === 'product') {
                            const p = o.p
                            const img = p.image ? getStrapiMedia(p.image.formats?.thumbnail?.url || p.image.url) : null
                            const price = p.sale_price ?? p.price
                            return (
                                <li key={`p-${p.id}`} id={`${listId}-${i}`} role="option" aria-selected={isActive} className={base} onClick={() => go(o.href)}>
                                    <span className="relative h-10 w-10 flex-shrink-0 rounded bg-white">
                                        {img ? <Image src={img} alt="" fill sizes="40px" className="object-contain p-0.5" /> : <FaRegImage className="m-auto mt-2 h-6 w-6 text-slate-300" />}
                                    </span>
                                    <span className="min-w-0 flex-1 line-clamp-2">{p.name}</span>
                                    {price != null && (
                                        <span className="flex-shrink-0 text-right font-semibold">
                                            {money(price)}
                                            {p.sale_price != null && p.price != null && p.sale_price < p.price && (
                                                <span className="block text-xs font-normal text-slate-400 line-through">{money(p.price)}</span>
                                            )}
                                        </span>
                                    )}
                                </li>
                            )
                        }
                        return (
                            <li key="all" id={`${listId}-${i}`} role="option" aria-selected={isActive} className={`${base} justify-center border-t border-slate-200 font-semibold text-siteColors-blue dark:border-slate-600`} onClick={() => go(o.href)}>
                                {o.label}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default SearchInput
