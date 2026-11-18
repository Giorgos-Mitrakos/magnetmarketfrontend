'use server'
// Server action για τα client components: αναφορά σφάλματος στο ταμείο
// προς την ομάδα. Το email το στέλνει το Strapi σε σταθερούς παραλήπτες
// (ORDER_ADMIN_EMAILS), με όριο ανά ώρα — δεν μπορεί να γίνει «ανοιχτό relay».
import { notifyAdmin } from './piraeusGateway'

export async function reportCheckoutError({ title, data }: { title: string, data: string }) {
    await notifyAdmin({
        title: String(title ?? 'Σφάλμα ταμείου').slice(0, 100),
        data: String(data ?? '').slice(0, 3000),
    })
}
