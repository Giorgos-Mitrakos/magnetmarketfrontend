// Περιγραφή κατηγορίας από τον Product Manager (2026-10-18).
// Μεγάλο κείμενο: φαίνεται η αρχή και το υπόλοιπο με «Περισσότερα» (χωρίς JavaScript).
// Όλο το κείμενο υπάρχει στη σελίδα, άρα το διαβάζει και το Google.
const PREVIEW = 260

export default function CategoryDescription({ text }: { text: string }) {
    const clean = text.trim()
    if (!clean) return null

    if (clean.length <= PREVIEW + 60) {
        return <p className="mx-auto mt-3 max-w-3xl whitespace-pre-line px-2 text-center text-sm text-gray-600 dark:text-gray-300">{clean}</p>
    }

    // Κόψιμο σε κενό, όχι στη μέση λέξης
    const cut = clean.lastIndexOf(' ', PREVIEW)
    const head = clean.slice(0, cut > 0 ? cut : PREVIEW)
    const rest = clean.slice(head.length)

    return (
        <details className="group mx-auto mt-3 max-w-3xl px-2 text-center text-sm text-gray-600 dark:text-gray-300">
            <summary className="cursor-pointer list-none whitespace-pre-line [&::-webkit-details-marker]:hidden">
                {head}
                <span className="group-open:hidden">… <span className="font-semibold text-siteColors-blue">Περισσότερα</span></span>
            </summary>
            <span className="whitespace-pre-line">{rest}</span>
        </details>
    )
}
