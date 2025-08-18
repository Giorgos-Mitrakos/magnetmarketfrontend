import { gql } from "graphql-request";
import { IImageAttr } from "../interfaces/image";
import { IProdChar, IProduct, IProductBrand } from "../interfaces/product";

export const GET_CATEGORY_PRODUCTS = gql`
query getCategoryProducts($filters:ProductFiltersInput!,$pagination:PaginationArg!,$sort:[String!]){
  products(filters: $filters,pagination:$pagination,sort:$sort){
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
            inventory
            is_in_house
            is_hot
            weight
            height
            width
            length
            status
            prod_chars (pagination:{limit:-1}){
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
                          alternativeText
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
                      name
                      alternativeText
                      url
                      formats
                    }
                }
            }
            category {
              data {
                id
                attributes {
                  name
                  parents {
                    data {
                      id
                      attributes {
                        name
                        slug                    
                        parents {
                          data {
                            id
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

export const GET_FILTERED_PRODUCTS = gql`
query getCategoryProducts($filters:ProductFiltersInput!,$pagination:PaginationArg!,$sort:[String!]){
  products(filters: $filters,
    pagination:$pagination,
    sort:$sort){
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
            prod_chars (pagination:{limit:-1}){
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
                          alternativeText
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
                    name
                    url
                    formats
                    alternativeText
                    }
                }
            }
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
          inventory
          is_in_house
        }
      }
    }
  }`

export const GET_PRODUCT_BY_SLUG = gql`
query getProductBySlug($slug:String!){
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
        inventory
        is_in_house
        publishedAt
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
                  alternativeText
                  url
                  formats
                }
              }
            }
          }
          keywords
          metaRobots
          structuredData
        }
        prod_chars(pagination:{limit:-1}){
          id
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
                          alternativeText
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
                    name
                    url
                    formats
                    alternativeText
                    }
                }
            }
        }
    }
  }
}`

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
}`

export const GET_HOT_OR_DEALS_PRODUCTS = gql`
query getProductPrice($filters:ProductFiltersInput!,$sort:[String!]){
    products(filters: $filters,pagination:{limit:10},sort:$sort){
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
          inventory
          is_in_house
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
          brand {
            data{
                  attributes{
                    name
                    slug
                    logo{
                      data{
                        attributes{
                          name
                          url
                          alternativeText
                          formats
                        }
                      }
                    }
                  }
                }
          }
          image{
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
    }
}`

