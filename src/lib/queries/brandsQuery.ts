import { gql } from "graphql-request";
import { IImageAttr } from "../interfaces/image";
import { IProductBrand } from "../interfaces/product";

export const GET_BRAND_PRODUCTS = gql`
query getBrandProducts($filters:ProductFiltersInput!,$pagination:PaginationArg!,$sort:[String!]){
  products(filters: $filters,pagination:$pagination,sort:$sort){
    data {
        id
        attributes {
          name
          slug
          sku
          mpn
          barcode
          price
          sale_price
          is_sale
          is_hot
          weight
          height
          width
          length
          status
          category {
            data {
              attributes {
                name
                parents {
                  data {
                    attributes {
                      name
                      slug                    
                      parents {
                        data {
                          attributes {
                            name
                            slug
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
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
