'use client'
// (2026-10-24) + autoComplete / inputMode / maxLength / hint, σωστή ετικέτα (htmlFor = id)
// και σύνδεση του μηνύματος λάθους με το πεδίο (aria-invalid / aria-describedby).

import { ChangeEvent, FocusEvent, HTMLAttributes } from "react";

interface ICustomInput {
    aria_label: string,
    type: string,
    id: string,
    name: string,
    onChange: (e: ChangeEvent<any>) => void,
    onBlur: (e: FocusEvent<any, Element>) => void,
    value: string,
    label?: string
    error?: string
    touched?: boolean
    /** Αυτόματη συμπλήρωση του browser (π.χ. "email", "given-name", "tel") */
    autoComplete?: string
    /** Πληκτρολόγιο στο κινητό (π.χ. "numeric", "tel", "email") */
    inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
    maxLength?: number
    /** Βοηθητικό κείμενο κάτω από το πεδίο */
    hint?: string
}

const CustomInput = (props: ICustomInput) => {
    const errorId = `${props.id}-error`
    const hintId = `${props.id}-hint`
    const hasError = !!props.error
    const describedBy = [hasError ? errorId : null, props.hint ? hintId : null].filter(Boolean).join(' ') || undefined

    return (
        <div className="min-h-min">
            <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {props.label}
            </label>
            <div className={`h-min w-full relative rounded-lg border border-1 bg-white appearance-none ${hasError ? 'border-red-400' : 'border-gray-300'}`}>
                <input
                    className='block rounded-lg px-2.5 pb-2.5 pt-3 w-full text-sm text-slate-900 dark:text-slate-200 bg-transparent dark:bg-slate-600 focus:outline-none focus:ring-0 peer focus:ring-blue-500 focus:border-blue-500'
                    aria-label={props.aria_label}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    type={props.type}
                    id={props.id}
                    name={props.name}
                    placeholder=''
                    autoComplete={props.autoComplete}
                    inputMode={props.inputMode}
                    maxLength={props.maxLength}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    value={props.value}
                />
            </div>
            {props.hint && !hasError && <small id={hintId} className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{props.hint}</small>}
            {hasError && <small id={errorId} className="text-sm text-red-500">{props.error}</small>}
        </div>
    )
}

export default CustomInput;
