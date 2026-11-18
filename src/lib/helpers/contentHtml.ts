// lib/helpers/contentHtml.ts
//
// (2026-10-26) Κείμενο σελίδων (/pages/...) και του block «Κείμενο».
// Το πεδίο του Strapi (richtext) γράφεται σε Markdown· οι παλιές σελίδες έχουν HTML.
// - Αν το κείμενο έχει ήδη HTML → μένει όπως είναι.
// - Αλλιώς → απλό Markdown σε HTML (τίτλοι, λίστες, έντονα/πλάγια, σύνδεσμοι, παράθεση, γραμμή).
// Και στις δύο περιπτώσεις καθαρίζεται (sanitize-html) — μόνο στον server.
import sanitize from 'sanitize-html'

const HTML_HINT = /<\s*(p|h[1-6]|ul|ol|li|div|br|table|strong|em|a|span|blockquote)\b/i

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i

function inline(text: string): string {
    let s = esc(text)
    // `κώδικας`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    // [κείμενο](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
        const u = url.replace(/&amp;/g, '&')
        return SAFE_URL.test(u) ? `<a href="${esc(u)}">${label}</a>` : label
    })
    // **έντονα** / __έντονα__
    s = s.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
    // *πλάγια* / _πλάγια_
    s = s.replace(/(^|[^\w*])\*(?=\S)([^*]*?\S)\*(?!\*)/g, '$1<em>$2</em>')
    s = s.replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?![\w])/g, '$1<em>$2</em>')
    return s
}

export function markdownToHtml(md: string): string {
    const lines = md.replace(/\r\n?/g, '\n').split('\n')
    const out: string[] = []
    let para: string[] = []
    let list: { type: 'ul' | 'ol'; items: string[] } | null = null
    let quote: string[] = []

    const flushPara = () => {
        if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`)
        para = []
    }
    const flushList = () => {
        if (list) out.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.type}>`)
        list = null
    }
    const flushQuote = () => {
        if (quote.length) out.push(`<blockquote><p>${quote.map(inline).join('<br>')}</p></blockquote>`)
        quote = []
    }
    const flushAll = () => {
        flushPara()
        flushList()
        flushQuote()
    }

    for (const raw of lines) {
        const line = raw.trimEnd()
        if (!line.trim()) {
            flushAll()
            continue
        }
        const h = /^(#{1,6})\s+(.*)$/.exec(line.trim())
        if (h) {
            flushAll()
            // Ένα h1 ανά σελίδα (ο τίτλος της) → οι τίτλοι του κειμένου ξεκινούν από h2
            const level = Math.min(6, Math.max(2, h[1].length + (h[1].length === 1 ? 1 : 0)))
            out.push(`<h${level}>${inline(h[2].replace(/\s+#+\s*$/, ''))}</h${level}>`)
            continue
        }
        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
            flushAll()
            out.push('<hr>')
            continue
        }
        const ul = /^\s*[-*+]\s+(.*)$/.exec(line)
        const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line)
        if (ul || ol) {
            flushPara()
            flushQuote()
            const type = ul ? 'ul' : 'ol'
            if (!list || list.type !== type) {
                flushList()
                list = { type, items: [] }
            }
            list.items.push((ul ?? ol)![1])
            continue
        }
        const q = /^\s*>\s?(.*)$/.exec(line)
        if (q) {
            flushPara()
            flushList()
            quote.push(q[1])
            continue
        }
        // Συνέχεια στοιχείου λίστας (γραμμή με εσοχή)
        if (list && /^\s{2,}\S/.test(raw)) {
            list.items[list.items.length - 1] += ' ' + line.trim()
            continue
        }
        flushList()
        flushQuote()
        para.push(line.trim())
    }
    flushAll()
    return out.join('\n')
}

/** HTML έτοιμο για dangerouslySetInnerHTML (Markdown ή HTML από το admin) */
export function contentHtml(content: string | null | undefined): string {
    const src = String(content ?? '').trim()
    if (!src) return ''
    const html = HTML_HINT.test(src) ? src : markdownToHtml(src)
    return sanitize(html, {
        allowedTags: [
            'p', 'br', 'hr', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'sup', 'sub',
            'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'figure', 'figcaption',
            'a', 'img', 'iframe',
        ],
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'loading'],
            td: ['colspan', 'rowspan'],
            th: ['colspan', 'rowspan', 'scope'],
            '*': ['id'],
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        allowProtocolRelative: false,
        // Μόνο ενσωματώσεις YouTube / Google Maps (π.χ. χάρτης στη σελίδα επικοινωνίας)
        allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'www.google.com', 'maps.google.com'],
        exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
        transformTags: {
            h1: 'h2',
            a: (tagName, attribs) => ({
                tagName,
                attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
            }),
            img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
            iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
        },
    }).trim()
}

/** Απλό κείμενο για meta description */
export function contentText(content: string | null | undefined, max = 160): string {
    const spaced = contentHtml(content).replace(/<br\s*\/?>|<\/(p|li|h\d|div|blockquote|td|th)>/gi, ' ')
    const text = sanitize(spaced, { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
    return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : text
}
