import { contentCache } from '../helpers/contentCache'
export interface IFooterLink {
  id: number
  label: string
  /** null → εμφανίζεται ως απλό κείμενο */
  href: string | null
  open_in_new_tab: boolean
}

export interface IFooterSection {
  id: number
  label: string
  links: IFooterLink[]
}

export interface IFooter {
  telephone: string | null
  opening_hours: string | null
  address: string | null
  city: string | null
  postcode: string | null
  email: string | null
  facebook_url: string | null
  instagram_url: string | null
  sections: IFooterSection[]
}

export async function getFooter(): Promise<IFooter | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/footer/getFooter`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: contentCache(60 * 60, ['footer']),
    })

    if (!response.ok) {
      console.error('Footer API error:', response.status, response.statusText)
      return null
    }

    return (await response.json()) as IFooter
  } catch (error) {
    return null
  }
}
