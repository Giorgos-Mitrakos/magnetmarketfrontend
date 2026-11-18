'use client'
import { useState, type ReactNode } from "react"
import { FaFilePdf, FaRegFileLines } from "react-icons/fa6"
import './ProductInfo.css'

/**
 * Περιγραφή / Χαρακτηριστικά / Αρχεία του προϊόντος.
 *
 * (2026-10-22) Η περιγραφή έρχεται ΗΔΗ καθαρισμένη από τον server
 * (lib/helpers/sanitizeHtml.ts) και ΟΛΕΣ οι καρτέλες υπάρχουν στο HTML της
 * σελίδας (οι ανενεργές απλώς κρυφές) — πριν, η περιγραφή εμφανιζόταν μόνο
 * αφού φορτώσει ο browser και τα χαρακτηριστικά μόνο με κλικ (κακό για SEO).
 */
interface ProductInfoClientProps {
    descriptionHtml: string,
    chars?: {
        id: number,
        name: string,
        value: string
    }[],
    files?: { name: string | null, url: string }[]
    /** (2026-10-24) Καρτέλα «Ερωτήσεις» (λίστα δημόσιων ερωτήσεων + φόρμα) */
    questions?: ReactNode
    questionsLabel?: string
}

type Tab = 'description' | 'specification' | 'files' | 'questions'

const fileLabel = (f: { name: string | null, url: string }) =>
    (f.name || decodeURIComponent(f.url.split('/').pop() || 'Αρχείο')).replace(/\.[a-z0-9]{2,4}$/i, '')

const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url)

const ProductInfoClient = ({ descriptionHtml, chars = [], files = [], questions, questionsLabel = 'Ερωτήσεις' }: ProductInfoClientProps) => {
    const tabs: { key: Tab, label: string }[] = [
        ...(descriptionHtml ? [{ key: 'description' as Tab, label: 'Περιγραφή' }] : []),
        ...(chars.length ? [{ key: 'specification' as Tab, label: 'Χαρακτηριστικά' }] : []),
        ...(files.length ? [{ key: 'files' as Tab, label: `Αρχεία (${files.length})` }] : []),
        ...(questions ? [{ key: 'questions' as Tab, label: questionsLabel }] : []),
    ]
    const [active, setActive] = useState<Tab | null>(tabs[0]?.key ?? null)

    if (!tabs.length) return null

    const tabClass = (key: Tab) =>
        `inline-block py-3 px-6 text-lg font-medium text-center rounded-t-lg border-b-2 transition-colors ${active === key
            ? "border-siteColors-blue text-siteColors-blue dark:text-siteColors-lightblue dark:border-siteColors-lightblue"
            : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`

    return (
        <section className="w-full">
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px" role="tablist">
                    {tabs.map(t => (
                        <li className="mr-2" role="presentation" key={t.key}>
                            <button
                                id={`tab-${t.key}`}
                                className={tabClass(t.key)}
                                type="button"
                                role="tab"
                                aria-controls={`panel-${t.key}`}
                                aria-selected={active === t.key}
                                onClick={() => setActive(t.key)}
                            >
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                {descriptionHtml && (
                    <div
                        id="panel-description"
                        className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        role="tabpanel"
                        aria-labelledby="tab-description"
                        hidden={active !== 'description'}
                    >
                        <div
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                            className="product-description dark:text-gray-300 overflow-x-auto"
                        />
                    </div>
                )}

                {chars.length > 0 && (
                    <div
                        id="panel-specification"
                        className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden"
                        role="tabpanel"
                        aria-labelledby="tab-specification"
                        hidden={active !== 'specification'}
                    >
                        <dl className="grid grid-cols-1 md:grid-cols-2">
                            {chars.map((char, index) => (
                                <div
                                    key={char.id ?? index}
                                    className={`flex p-4 ${index % 2 === 0 ? 'md:border-r border-gray-100 dark:border-gray-600' : ''} ${index < chars.length - (chars.length % 2 === 0 ? 0 : 1) ? 'border-b border-gray-100 dark:border-gray-600' : ''}`}
                                >
                                    <dt className="w-1/3 md:w-2/5 mr-2 font-medium text-gray-700 dark:text-gray-300">
                                        {char.name}
                                    </dt>
                                    <dd className="w-2/3 md:w-3/5 text-gray-600 dark:text-gray-200">
                                        {char.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}

                {files.length > 0 && (
                    <div
                        id="panel-files"
                        className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        role="tabpanel"
                        aria-labelledby="tab-files"
                        hidden={active !== 'files'}
                    >
                        <ul className="space-y-2">
                            {files.map((f, i) => (
                                <li key={`${f.url}-${i}`}>
                                    <a
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-siteColors-blue dark:text-siteColors-lightblue hover:underline"
                                    >
                                        {isPdf(f.url) ? <FaFilePdf className="shrink-0" /> : <FaRegFileLines className="shrink-0" />}
                                        <span>{fileLabel(f)}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {questions && (
                    <div
                        id="panel-questions"
                        className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        role="tabpanel"
                        aria-labelledby="tab-questions"
                        hidden={active !== 'questions'}
                    >
                        {questions}
                    </div>
                )}
            </div>
        </section>
    )
}

export default ProductInfoClient
