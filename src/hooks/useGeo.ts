"use client"
// Νομοί / περιοχές / Τ.Κ. για τις φόρμες διευθύνσεων — Strapi v3 (REST).
// Οι απαντήσεις έχουν την παλιά μορφή GraphQL (countries.data[0].attributes
// .states.data κ.λπ.), ώστε οι φόρμες να μην αλλάξουν.
import useSWR from "swr"

type GeoKind = 'countries' | 'states' | 'regions' | 'postals'

const geoFetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    return response.json()
}

/**
 * kind 'countries': χωρίς παραμέτρους.
 * 'states' → { country }, 'regions' → { state }, 'postals' → { region, state? }.
 * Αν λείπει η βασική παράμετρος, δεν γίνεται αίτημα (data: undefined).
 */
export function useGeo(kind: GeoKind, params: Record<string, string | undefined | null> = {}) {
    const required: Record<GeoKind, string | null> = {
        countries: null,
        states: 'country',
        regions: 'state',
        postals: 'region',
    }
    const key = required[kind]
    const ready = key === null || !!params[key]

    const query = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) query.set(k, v)
    const url = `/api/storefront/geo/${kind}${query.toString() ? `?${query}` : ''}`

    const { data, isLoading, error } = useSWR(ready ? url : null, geoFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    return { data, loading: isLoading, error }
}
