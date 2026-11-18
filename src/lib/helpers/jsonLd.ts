// lib/helpers/jsonLd.ts
//
// (2026-10-22) JSON-LD μέσα σε <script>: escape του «<» (και U+2028/9) ώστε
// κείμενο από προμηθευτές/admin να μη μπορεί να κλείσει το script ή να
// χαλάσει το JSON. Αντικαθιστά το παλιό JSON.stringify(...).replaceAll(...).
export function jsonLd(data: unknown): string {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
}
