/**
 * Cache για περιεχόμενο που αλλάζει από το admin του Strapi
 * (αρχική, footer, ανακοίνωση, σελίδες, μενού).
 *
 * - Development: ΧΩΡΙΣ cache → κάθε αλλαγή στο Strapi φαίνεται με ένα refresh.
 *   (Το cache του Next.js γράφεται στον δίσκο, στο .next/cache, και ΔΕΝ
 *   σβήνει με restart — γι' αυτό «κολλούσαν» οι παλιές τιμές.)
 * - Production: cache για `seconds`, και άμεση ανανέωση μέσω του webhook
 *   του Strapi → /api/revalidate (tags).
 */
export function contentCache(seconds: number, tags: string[]) {
    if (process.env.NODE_ENV === 'development') {
        return { revalidate: 0, tags }
    }
    return { revalidate: seconds, tags }
}
