import { contentCache } from '../helpers/contentCache'
export interface IAnnouncement {
  text: string
  type: 'info' | 'warning' | 'important' | 'event'
  is_closable: boolean
  href: string | null
  link_label: string | null
  /** Αλλάζει όταν αλλάξει η ανακοίνωση → ξαναεμφανίζεται σε όσους την είχαν κλείσει */
  version: string
}

/** null όταν δεν υπάρχει ενεργή ανακοίνωση (ανενεργή ή εκτός «Από/Έως») */
export async function getAnnouncement(): Promise<IAnnouncement | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcement`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: contentCache(300, ['announcement']),
    })
    if (!response.ok) return null
    const data = await response.json()
    return (data?.announcement ?? null) as IAnnouncement | null
  } catch {
    return null
  }
}
