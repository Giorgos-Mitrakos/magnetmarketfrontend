// lib/helpers/sanitizeHtml.ts
//
// (2026-10-22) Καθάρισμα HTML περιγραφών ΣΤΟΝ SERVER (οι περιγραφές έρχονται
// από feeds προμηθευτών): ό,τι δεν είναι στη λίστα αφαιρείται — scripts,
// iframes, on* attributes, javascript: links κ.λπ. Έτσι η περιγραφή υπάρχει
// στο HTML της σελίδας (SEO) χωρίς να περιμένει τον browser.
//
// Εξάρτηση: npm i sanitize-html && npm i -D @types/sanitize-html
import sanitize from 'sanitize-html'

const ALLOWED_TAGS = [
    'p', 'br', 'hr', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'sup', 'sub',
    'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'figure', 'figcaption',
    'a', 'img',
]

/** Μερικά feeds στέλνουν το HTML «κωδικοποιημένο» (&lt;p&gt;…) */
function decodeIfEscaped(html: string): string {
    if (/<[a-z!/]/i.test(html) || !/&lt;/i.test(html)) return html
    return html
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#0*39;|&apos;/gi, "'")
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
}

export function sanitizeProductHtml(html: string | null | undefined): string {
    if (!html || typeof html !== 'string') return ''
    return sanitize(decodeIfEscaped(html), {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            td: ['colspan', 'rowspan'],
            th: ['colspan', 'rowspan', 'scope'],
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        allowProtocolRelative: false,
        // h1 της περιγραφής → h2 (μία h1 ανά σελίδα: το όνομα του προϊόντος)
        transformTags: {
            h1: 'h2',
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer nofollow' } : { rel: attribs.rel ?? 'nofollow' }),
                },
            }),
            img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
        },
        allowedSchemesByTag: { img: ['http', 'https'] },
    }).trim()
}

/** Καθαρό κείμενο (για meta description / structured data) */
export function plainText(html: string | null | undefined, max = 300): string {
    if (!html) return ''
    const text = sanitize(decodeIfEscaped(String(html)), { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}
