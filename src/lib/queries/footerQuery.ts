import { HTMLAttributeAnchorTarget } from "react";


interface IFooter {
  id: number
  telephone: string
  opening_hours: string
  address: string
  city: string
  postcode: string
  email: string
  sections: IFooterSection[]
}

export interface IFooterSection {
  id: number
  Label: string
  links: {
    id: number
    label: string
    isLink: boolean
    href: string
    target: HTMLAttributeAnchorTarget
  }[]
}

export async function getFooter() {
  try {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`)

    const myInit = {
      method: "GET",
      headers: myHeaders,
      body:null,
      next: {
        revalidate: 24 * 60 * 60 // Χρήση της μεταβλητής cacheTime
      }
      // mode: "cors",
      // cache: "default",
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/footer/getFooter`, myInit)

    // Ελέγχω αν η response είναι επιτυχής
    if (!response.ok) {
      console.error('Footer API error:', response.status, response.statusText)
      return null; // ← Επιστρέφω null αντί για undefined
    }

    const data = await response.json() as IFooter

    return data
  } catch (error) {
    return null
  }
}