"use client"
// Δεδομένα λογαριασμού του συνδεδεμένου πελάτη (μέσω των routes του Next.js).
// Χωρίς σύνδεση δεν γίνεται αίτημα (data: undefined).
import useSWR from "swr"
import { useSession } from "next-auth/react"

const accountFetcher = async (url: string) => {
    const response = await fetch(url, { cache: 'no-store' })
    const json = await response.json().catch(() => null)
    if (!response.ok) throw new Error(json?.message || `Response status: ${response.status}`)
    return json
}

export function useAccount<T = any>(kind: 'profile' | 'orders') {
    const { status } = useSession()
    const { data, isLoading, error, mutate } = useSWR<T>(
        status === 'authenticated' ? `/api/account/${kind}` : null,
        accountFetcher,
        { revalidateOnFocus: false }
    )
    return { data, loading: status === 'loading' || isLoading, error, mutate }
}
