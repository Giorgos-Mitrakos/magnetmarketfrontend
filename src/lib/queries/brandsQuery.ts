import { gql } from "graphql-request";
import { IimageProps } from "./categoryQuery";

export const GET_BRAND_PRODUCTS = gql`
query getBrandProducts($filters:ProductFiltersInput!,$pagination:PaginationArg!,$sort:[String!]){
  products(filters: $filters,pagination:$pagination,sort:$sort){
    data {
        id
        attributes {
        name
        slug
        brand{
            data{
                attributes{
                    name
                    slug
                    logo{
                        data{
                            attributes{
                                name
                                alternativeText
                                url
                                formats
                            }
                        }
                    }
                }
            }
        }
        image {
          data {
            attributes {
              name
              alternativeText
              url
              formats
            }
          }
        }
      }
    }
    meta{
      pagination{
        total
        page
        pageSize
        pageCount
      }
    }
  }
}`

export const GET_BRANDS = gql`
query getBrands{
  brands(pagination:{limit:-1}){
    data{
      id
      attributes{
        name
        slug
        logo{
          data{
            attributes{
              url
              name
              alternativeText
              formats
            }
          }
        }
      }
    }
  }
}`

export interface IbrandsProps {
  brands: {
    data: {
      id: number
      attributes: {
        name: string
        slug: string
        logo: {
          data: {
            attributes: {
              url: string
              name: string
              alternativeText: string
              formats: { small: IimageProps }
            }
          }
        }
      }
    }[]
  }
}