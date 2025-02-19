import { gql } from "graphql-request";

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