// «Είδατε πρόσφατα»: τα τελευταία προϊόντα που είδε ο επισκέπτης, μόνο στον
// browser του (localStorage) — κανένα κόστος για τον server, τίποτα προσωπικό.
const KEY = 'mm_recent'
const MAX = 12
const EVENT = 'mm:recently-viewed'

const valid = (s: unknown): s is string => typeof s === 'string' && /^[a-z0-9]{10,40}$/i.test(s)

export function getRecentlyViewed(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw.filter(valid).slice(0, MAX) : []
  } catch {
    return []
  }
}

export function addRecentlyViewed(documentId?: string | null) {
  if (!valid(documentId)) return
  try {
    const list = [documentId, ...getRecentlyViewed().filter((x) => x !== documentId)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // ιδιωτική περιήγηση / γεμάτο storage — απλώς δεν κρατάμε ιστορικό
  }
}

export const RECENTLY_VIEWED_EVENT = EVENT
