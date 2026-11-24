'use client'

// (2026-11-24) Επιλογή Νομού/Πόλης με πληκτρολόγηση (αντί για <select>).
// Στο κινητό οι λίστες είναι πολύ μεγάλες για σκρολάρισμα: ο πελάτης γράφει
// λίγα γράμματα (χωρίς τόνους, πεζά ή κεφαλαία) και διαλέγει από τη λίστα.
// Η τιμή του πεδίου αλλάζει ΜΟΝΟ όταν επιλεγεί κάτι από τη λίστα (ή όταν το
// κείμενο ταιριάζει ακριβώς με μία επιλογή) — έτσι δεν αποθηκεύεται ποτέ
// νομός/πόλη που δεν υπάρχει (το χρειάζονται τα μεταφορικά και η ζώνη).

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

// Κανονικοποίηση για αναζήτηση: χωρίς τόνους/διαλυτικά, κεφαλαία, χωρίς διπλά κενά
const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()

const MAX_SHOWN = 80

type Props = {
    id: string
    name: string
    value: string
    options: string[]
    placeholder: string
    onSelect: (value: string) => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    loading?: boolean
    disabled?: boolean
    invalid?: boolean
    inputClassName: string
    autoComplete?: string
}

export default function GeoCombobox({
    id, name, value, options, placeholder, onSelect, onBlur,
    loading = false, disabled = false, invalid = false, inputClassName, autoComplete = 'off',
}: Props) {
    const listId = useId()
    const [query, setQuery] = useState(value)
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(0)
    const listRef = useRef<HTMLUListElement>(null)

    // Όταν αλλάζει η τιμή απ' έξω (π.χ. καθαρίστηκε επειδή άλλαξε ο νομός)
    useEffect(() => { if (!open) setQuery(value) }, [value, open])

    const filtered = useMemo(() => {
        const q = norm(query)
        // Με ανοιχτή λίστα και κείμενο ίδιο με την τρέχουσα τιμή → όλες οι επιλογές
        if (!q || (value && q === norm(value))) return options
        const starts: string[] = []
        const contains: string[] = []
        for (const o of options) {
            const n = norm(o)
            if (n.startsWith(q)) starts.push(o)
            else if (n.includes(q)) contains.push(o)
        }
        return [...starts, ...contains]
    }, [query, options, value])

    const shown = filtered.slice(0, MAX_SHOWN)

    useEffect(() => { setActive(0) }, [query])

    // Η ενεργή επιλογή μένει ορατή όταν κινούμαστε με τα βελάκια
    useEffect(() => {
        if (!open) return
        const el = listRef.current?.children[active] as HTMLElement | undefined
        el?.scrollIntoView({ block: 'nearest' })
    }, [active, open])

    const choose = (o: string) => {
        setQuery(o)
        setOpen(false)
        if (o !== value) onSelect(o)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Κείμενο που ταιριάζει ακριβώς με μία επιλογή → την κρατάμε· αλλιώς επιστροφή στην τρέχουσα τιμή
        const exact = options.find(o => norm(o) === norm(query))
        if (exact) choose(exact)
        else { setQuery(value); setOpen(false) }
        onBlur?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!open) setOpen(true)
            else setActive(a => Math.min(a + 1, shown.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive(a => Math.max(a - 1, 0))
        } else if (e.key === 'Enter') {
            if (open && shown[active]) {
                e.preventDefault()
                choose(shown[active])
            }
        } else if (e.key === 'Escape') {
            setQuery(value)
            setOpen(false)
        }
    }

    const isDisabled = disabled || (!loading && options.length === 0)

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
                aria-invalid={invalid || undefined}
                autoComplete={autoComplete}
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                disabled={isDisabled}
                placeholder={loading ? 'Φόρτωση…' : placeholder}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                onFocus={(e) => { setOpen(true); e.currentTarget.select() }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`${inputClassName} pr-9 disabled:opacity-60`}
            />
            <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>

            {open && !isDisabled && (
                <ul
                    id={listId}
                    ref={listRef}
                    role="listbox"
                    className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
                >
                    {shown.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">Δεν βρέθηκε — δοκιμάστε άλλη γραφή</li>
                    ) : shown.map((o, i) => (
                        <li
                            key={o}
                            id={`${listId}-${i}`}
                            role="option"
                            aria-selected={o === value}
                            // mousedown (όχι click): αλλιώς το blur του πεδίου κλείνει τη λίστα πριν την επιλογή
                            onMouseDown={(e) => { e.preventDefault(); choose(o) }}
                            onMouseEnter={() => setActive(i)}
                            className={`cursor-pointer px-3 py-2 text-sm ${i === active ? 'bg-gray-100 dark:bg-slate-700' : ''} ${o === value ? 'font-semibold' : ''} text-gray-900 dark:text-white`}
                        >
                            {o}
                        </li>
                    ))}
                    {filtered.length > MAX_SHOWN && (
                        <li className="px-3 py-2 text-xs text-gray-500 dark:text-slate-400">…γράψτε περισσότερα γράμματα για να περιορίσετε τη λίστα</li>
                    )}
                </ul>
            )}
        </div>
    )
}
