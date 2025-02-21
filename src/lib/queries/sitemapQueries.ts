import { gql } from "graphql-request";

export const GET_PRODUCTS_SITEMAP = gql`
query getProductsSitemap{
    products(pagination:{limit:-1}){
    data{
      attributes{
        slug
        updatedAt
      }
    }
  }
}
`

export interface IProductsSitemapProps {
  products: {
    data: {
      attributes: {
        slug: string
        updatedAt: Date
      }
    }[]
  }
}

export const GET_CATEGORIES_SITEMAP = gql`
{
    categories(filters:{parents:{id:{eq:null}}},pagination:{limit:-1}){
        data{
          attributes{
            name
            slug
            updatedAt
            categories(pagination:{limit:-1}){
                data{
                  attributes{
                    name
                    slug
                    updatedAt
                    categories(pagination:{limit:-1}){
                        data{
                          attributes{
                            name
                            slug
                            updatedAt
                          }
                        }
                    }
                  }
                }
            }
          }
        }
    }
}`

export interface IcategoriesSiteMapProps {
  categories: {
    data: [{
      attributes: {
        name: string
        slug: string
        updatedAt: Date
        categories: {
          data: [{
            attributes: {
              name: string
              slug: string
              updatedAt: Date
              categories: {
                data: [{
                  attributes: {
                    name: string
                    slug: string
                    updatedAt: Date
                  }
                }]
              }
            }
          }]
        }
      }
    }]
  }
}

export const GET_PAGES_SITEMAP = gql`
query getPagesSitemap{
    pages(pagination:{limit:-1}){
    data{
      attributes{
        titleSlug
        updatedAt
      }
    }
  }
}
`

export interface IPagesSitemapProps {
  pages: {
    data: {
      attributes: {
        titleSlug: string
        updatedAt: Date
      }
    }[]
  }
}

export const GET_BRANDS_SITEMAP = gql`
query getBrandsSitemap{
    brands(pagination:{limit:-1}){
    data{
      attributes{
        name
        slug
        updatedAt
        products{
          data{
            id
          }
        }
      }
    }
  }
}
`

export interface IBrandsSitemapProps {
  brands: {
    data: {
      attributes: {
        name: string
        slug: string
        updatedAt: Date
        products: {
          data: {
            id: number
          }[]
        }
      }
    }[]
  }
}