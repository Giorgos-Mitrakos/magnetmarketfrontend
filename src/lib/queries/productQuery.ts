import { gql } from "graphql-request";
import { IimageProps } from "./categoryQuery";

export const GET_CATEGORY_PRODUCTS = gql`
query getCategoryProducts($filters:ProductFiltersInput!,$sort:[String!]){
  products(filters: $filters,pagination:{limit:-1},sort:$sort){
    data{
        id
        attributes{
            name
            slug
            prod_chars {
              name
              value
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
                          url
                          formats
                        }
                      }
                    }
                  }
                }
              }
            image{
                data{
                    attributes{
                    url
                    alternativeText
                    }
                }
            }
        }
    }
  }
}`

export interface IcategoryProductsProps {
  products: {
    data: [{
      id: number
      attributes: {
        name: string
        slug: string
        prod_chars: {
          name: string
          value: string
        }[]
        brand: {
          data: {
            attributes: {
              name: string,
              slug: string,
              logo: {
                data: {
                  attributes: {
                    name: string
                    url: string
                    formats: {
                      thumbnail: IimageProps,
                      small: IimageProps
                    }
                  }
                }
              }
            }
          }
        }
        image: {
          data: {
            attributes: {
              url: string
              alternativeText: string
            }
          }
        }
      }
    }]
  }
}

export const GET_PRODUCT_PRICE = gql`
query getProductPrice($id:ID!){
    product(id:$id){
      data{
        attributes{
          price
          sale_price
          is_hot
          is_sale
          status
        }
      }
    }
  }`

export interface IProductPriceProps {
  product: {
    data: {
      attributes: {
        price: number
        sale_price: number
        is_hot: boolean
        is_sale: boolean
        status: string
      }
    }
  }
}

export const GET_PRODUCT_BY_SLUG = gql`
query getCategoryProducts($slug:String!){
  products(
    filters: {
      slug: { eq: $slug }
    }
  ) {
    data {
      id
      attributes {
        name
        slug
        sku
        mpn
        barcode
        description
        short_description
        price
        sale_price
        is_sale
        is_hot
        supplierInfo {
          name
          wholesale
          in_stock
        }
        image {
          data {
            attributes {
              name
              url
              previewUrl
              alternativeText
              caption
              formats
              width
              height
              hash
              ext
              mime
              size
            }
          }
        }
        additionalImages {
          data {
            attributes {
              name
              url
              previewUrl
              alternativeText
              caption
              formats
              width
              height
              hash
              ext
              mime
              size
            }
          }
        }
        category {
          data {
            attributes {
              name
              slug
              filters {
                name
              }
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
              logo{
                data{
                  attributes{
                    url
                  }
                }
              }
            }
          }
        }
        status
        seo {
          metaTitle
          metaDescription
          metaImage{
            data{
              attributes{
                name
                alternativeText
                url
                formats
              }
            }
          }
          metaSocial{
            socialNetwork
            title
            description
            image{
              data{
                attributes{
                  name
                  url
                }
              }
            }
          }
          keywords
          metaRobots
          structuredData
        }
        prod_chars{
          name
          value
        }
        weight
        height
        width
        length
        
      }
    }
  }
}`

export interface IProductProps {
  products: {
    data: {
      id: number
      attributes: {
        name: string
        slug: string
        sku: string
        mpn: string
        barcode: string
        description: string
        short_description: string
        price: number
        sale_price: number
        is_sale: boolean
        is_hot: boolean
        supplierInfo: {
          name: string
          wholesale: number
          in_stock: boolean
        }[]
        image: {
          data: {
            attributes: {
              name: string
              url: string
              previewUrl: string
              alternativeText: string
              caption: string
              formats: any
              width: number
              height: number
              hash: string
              ext: string
              mime: string
              size: string
            }
          }
        }
        additionalImages: {
          data: {
            attributes: {
              name: string
              url: string
              previewUrl: string
              alternativeText: string
              caption: string
              formats: any
              width: number
              height: number
              hash: string
              ext: string
              mime: string
              size: string
            }
          }[]
        }
        category: {
          data: {
            attributes: {
              name: string
              slug: string
              filters: {
                name: string
              }[]
              parents: {
                data: {
                  attributes: {
                    name: string
                    slug: string
                    parents: {
                      data: {
                        attributes: {
                          name: string
                          slug: string
                        }
                      }[]
                    }
                  }
                }[]
              }
            }
          }
        }
        brand: {
          data: {
            id: number
            attributes: {
              name: string
              logo: {
                data: {
                  attributes: {
                    url: string
                  }
                }
              }
            }
          }
        }
        status: string
        seo: {
          metaTitle: string
          metaDescription: string
          metaImage: {
            data: {
              attributes: {
                name: string
                alternativeText: string
                url: string
                formats: string
              }
            }
          }
          metaSocial: {
            socialNetwork: string
            title: string
            description: string
            image: {
              data: {
                attributes: {
                  name: string
                  url: string
                }
              }
            }
          }
          keywords: string
          metaRobots: string
          structuredData: string
        }
        prod_chars: {
          id: number
          name: string
          value: string
        }[]
        weight: number
        height: number
        width: number
        length: number

      }
    }[]
  }
}

export const GET_SUGGESTED_PRODUCTS = gql`
query getCategoryProducts($filters:ProductFiltersInput!){
  products(filters: $filters,pagination:{limit:-1}){
    data{
        id
        attributes{
            name
            slug
            price
            sale_price
            is_sale
            is_hot
            supplierInfo {
              name
              wholesale
              in_stock
            }
            prod_chars {
              name
              value
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
                          url
                          formats
                        }
                      }
                    }
                  }
                }
              }
            image{
                data{
                    attributes{
                    url
                    alternativeText
                    }
                }
            }
        }
    }
  }
}`

export interface IsuggestedProductsProps {
  products: {
    data: [{
      id: number
      attributes: {
        name: string
        slug: string
        price: number
        sale_price: number
        is_sale: boolean
        is_hot: boolean
        supplierInfo: {
          name: string
          wholesale: number
          in_stock: boolean
        }[]
        prod_chars: {
          name: string
          value: string
        }[]
        brand: {
          data: {
            attributes: {
              name: string,
              slug: string,
              logo: {
                data: {
                  attributes: {
                    name: string
                    url: string
                    formats: {
                      thumbnail: IimageProps,
                      small: IimageProps
                    }
                  }
                }
              }
            }
          }
        }
        image: {
          data: {
            attributes: {
              url: string
              alternativeText: string
            }
          }
        }
      }
    }]
  }
}

export interface IGetCartProductsProps {
  products: {
    data: [{
      id: number
      attributes: {
        name: string
        slug: string
        sku: string
        mpn: string
        barcode: string
        price: number
        sale_price: number
        is_sale:boolean
        is_hot:boolean
        weight: number
        height: number
        width: number
        length: number
        status: string
        brand: {
          data: {
            attributes: {
              name: string,
              slug: string
            }
          }
        }
        image: {
          data: {
            attributes: {
              url: string
              alternativeText: string
            }
          }
        }
      }
    }]
  }
}

export const GET_CART_PRODUCTS = gql`
query getProductPrice($filters:ProductFiltersInput!){
    products(filters: $filters,pagination:{limit:-1}){
      data{
        id
        attributes{
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
          brand {
            data {
              attributes {
                name
                slug
              }
            }
          }
          image{
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
        }
      }
    }
}`

