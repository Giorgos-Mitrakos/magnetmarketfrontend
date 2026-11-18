'use client'
import { useEffect, useRef, useState } from 'react'
import { DropdownFilter, DropdownItem } from '../organisms/categoryPageHeader';
import { FaCaretDown } from 'react-icons/fa';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trackSortUsage } from '@/lib/helpers/advanced-analytics';


export default function Dropdown({ items, filter }: DropdownFilter) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null)

    // (2026-10-18) Η επιλογή βγαίνει πάντα από τη διεύθυνση — σωστή και μετά το «πίσω»
    const current = searchParams.get(filter)
    const selectedItem = items.find(item => item.route === current) ?? items[0]

    // Κλείσιμο με Esc ή κλικ έξω
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
        const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false) }
        document.addEventListener('keydown', onKey)
        document.addEventListener('mousedown', onClick)
        return () => {
            document.removeEventListener('keydown', onKey)
            document.removeEventListener('mousedown', onClick)
        }
    }, [isOpen])

    const handleItemClick = (item: DropdownItem) => {
        setIsOpen(false)

        if (filter === 'sort') {
            trackSortUsage(item.route || 'default');
        }

        const params = new URLSearchParams(searchParams.toString())
        // Νέα ταξινόμηση ή πλήθος ανά σελίδα → από τη σελίδα 1
        params.delete('page')
        if (items[0] === item) {
            params.delete(filter)
        }
        else {
            params.set(filter, item.route)
        }

        const qs = params.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }

    return (
        <div ref={ref} className="relative flex items-center">
            <button
                type="button"
                className="flex items-center gap-1 hover:text-blue-400"
                onClick={() => setIsOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{selectedItem.title}</span>
                <FaCaretDown aria-hidden="true" />
            </button>
            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute top-8 z-20 flex min-w-max flex-col divide-y-2 overflow-hidden rounded-md bg-gray-50 shadow-lg dark:bg-slate-800"
                >
                    {items.map(item => (
                        <li key={item.title} role="option" aria-selected={item === selectedItem}>
                            <button
                                type="button"
                                className={`w-full p-4 text-left font-normal hover:bg-slate-100 dark:hover:bg-slate-700 ${item === selectedItem ? 'font-semibold text-siteColors-blue dark:text-slate-100' : ''}`}
                                onClick={() => handleItemClick(item)}
                            >
                                {item.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
