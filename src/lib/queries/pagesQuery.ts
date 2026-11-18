import { contentCache } from '../helpers/contentCache'
import { IBlock, ISeoData } from "./homepage"

export interface IPageData {
  title: string
  slug: string
  /** Κείμενο σελίδας (HTML / markdown από το admin) */
  content: string | null
  /** Προαιρετικά blocks (ίδια με της αρχικής) κάτω από το κείμενο */
  body: IBlock[]
  noindex: boolean
  seo: ISeoData | null
  updatedAt: string
}

export async function getPage(slug: string): Promise<IPageData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pages/${encodeURIComponent(slug)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: contentCache(3600, ['pages']),
      }
    )
    if (!response.ok) return null
    const data = await response.json()
    return (data?.page ?? null) as IPageData | null
  } catch {
    return null
  }
}

export interface IPageListItem {
  title: string
  slug: string
  noindex: boolean
  updatedAt: string
}

export async function getPagesList(): Promise<IPageListItem[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: contentCache(3600, ['pages']),
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data?.pages ?? []) as IPageListItem[]
  } catch {
    return []
  }
}
