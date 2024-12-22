import { gql } from "graphql-request";

export const GET_PAGE_DATA = gql`
query getPageData($title:String!){
    pages(filters:{titleSlug:{eq:$title}}){
        data{
          attributes{
            title
            mainText
          }
        }
    }
}
`

export interface IPageDataProps {
    pages: {
        data: {
            attributes: {
                title: string
                mainText: string
            }
        }[]
    }
}