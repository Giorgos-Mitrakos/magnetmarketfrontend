import { gql } from "graphql-request";

export const GET_FOOTER = gql`
{
    footer{
      data{
        attributes{
          telephone
          opening_hours
          address
          city
          postcode
          email
          sections{
            id
            Label
            links{
              id
              label
              href
              target
              isLink
            }
          }
        }
      }
    }
  }`

export interface IfooterProps {
  footer: {
    data: {
      attributes: {
        telephone: string
        opening_hours: string
        address: string
        city: string
        postcode: string
        email: string
        sections: [{
          id: string
          Label: string
          links: [{
            id: string
            label: string
            href: string
            target:string
            isLink: boolean
          }]
        }]
      }
    }
  }
}