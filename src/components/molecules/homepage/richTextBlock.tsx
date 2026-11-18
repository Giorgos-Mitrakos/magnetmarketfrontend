// Ελεύθερο κείμενο από το admin (ίδια εμφάνιση με τις σελίδες /pages/...).
// (2026-10-26) Markdown ή HTML → καθαρό HTML στον server (lib/helpers/contentHtml)
import { contentHtml } from '@/lib/helpers/contentHtml'

const RichTextBlock = ({ id, title, body }: { id: string; title: string | null; body: string }) => {
    const html = contentHtml(body)
    if (!html && !title) return null
    return (
        <section id={id} className="py-8 px-4 bg-slate-50 dark:bg-slate-700 rounded">
            {title && <h2 className="font-bold text-xl text-center mb-6">{title}</h2>}
            <div className="max-w-3xl mx-auto prose-content" dangerouslySetInnerHTML={{ __html: html }} />
        </section>
    )
}

export default RichTextBlock
