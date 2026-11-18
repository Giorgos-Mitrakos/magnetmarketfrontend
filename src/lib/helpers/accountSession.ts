// lib/helpers/accountSession.ts
// JWT του συνδεδεμένου πελάτη από το session του next-auth (μόνο στον server).
import { getSession } from "@/app/api/auth/[...nextauth]/options";

export async function sessionJwt(): Promise<string | null> {
    try {
        const session: any = await getSession()
        return session?.user?.jwt ?? null
    } catch {
        return null
    }
}
