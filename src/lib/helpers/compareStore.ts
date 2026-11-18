'use client'
/**
 * (2026-10-23) Λίστα σύγκρισης προϊόντων (έως 4) — στον browser (localStorage),
 * κοινή για όλες τις καρτέλες. Χρήση: const items = useCompare(); toggleCompare(item)
 */
import { useSyncExternalStore } from 'react'

export const COMPARE_MAX = 4
const KEY = 'mm_compare'
const EVENT = 'mm-compare-change'

export interface CompareItem {
  documentId: string
  slug: string
  name: string
  image: string | null
  /** Κατηγορία — για προειδοποίηση όταν συγκρίνονται διαφορετικά είδη */
  category: string | null
}

let cache: CompareItem[] | null = null
const EMPTY: CompareItem[] = []

function read(): CompareItem[] {
  if (typeof window === 'undefined') return EMPTY
  if (cache) return cache
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    cache = Array.isArray(raw) ? raw.filter(x => x && typeof x.documentId === 'string').slice(0, COMPARE_MAX) : []
  } catch {
    cache = []
  }
  return cache!
}

function write(items: CompareItem[]) {
  cache = items.slice(0, COMPARE_MAX)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    /* ιδιωτική περιήγηση κ.λπ. — κρατάμε μόνο στη μνήμη */
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      cb()
    }
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}

export function useCompare(): CompareItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

export function isInCompare(documentId: string): boolean {
  return read().some(x => x.documentId === documentId)
}

/** Προσθήκη/αφαίρεση. Επιστρέφει 'added' | 'removed' | 'full' */
export function toggleCompare(item: CompareItem): 'added' | 'removed' | 'full' {
  const items = read()
  if (items.some(x => x.documentId === item.documentId)) {
    write(items.filter(x => x.documentId !== item.documentId))
    return 'removed'
  }
  if (items.length >= COMPARE_MAX) return 'full'
  write([...items, item])
  return 'added'
}

export function removeFromCompare(documentId: string) {
  write(read().filter(x => x.documentId !== documentId))
}

export function clearCompare() {
  write([])
}

export const compareUrl = (items: { documentId: string }[]) =>
  `/compare?ids=${items.map(x => encodeURIComponent(x.documentId)).join(',')}`
