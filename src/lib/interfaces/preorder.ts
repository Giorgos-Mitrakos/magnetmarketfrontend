// lib/interfaces/preorder.ts
//
// (2026-10-22) Σύνδεσμος προπαραγγελίας για προϊόν «Αναμένεται» (?pp=… στη
// σελίδα προϊόντος). Τον φτιάχνει ο admin στον Product Manager για πελάτη με
// τον οποίο μίλησε· ο έλεγχος γίνεται στο Strapi (σελίδα + παραγγελία).

export type PreorderPassView =
    | {
        token: string
        valid: true
        maxQuantity: number
        expiresAt: string | null
        note: string | null
        /** Ο σύνδεσμος είναι δεμένος σε email πελάτη */
        emailBound: boolean
    }
    | {
        token: string
        valid: false
        message: string
    }
