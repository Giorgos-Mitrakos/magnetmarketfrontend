import { gql } from "graphql-request";
import { IImageAttr } from "../interfaces/image";
import { IProdChar, IProductBrand } from "../interfaces/product";

export const GET_CATEGORIES_MAPPING = gql`
{
    categories(filters:{parents:{id:{eq:null}}},pagination:{limit:-1}){
        data{
          attributes{
            name
            slug
            categories(pagination:{limit:-1}){
                data{
                  attributes{
                    name
                    slug
                    categories(pagination:{limit:-1}){
                        data{
                          attributes{
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
}`

export const GET_CATEGORY_CHILDS = gql`
query getCategoryChilds($slug:String!){
    categories(filters:{slug:{eq:$slug}},pagination:{limit:-1}){
        data{
          attributes{
            name
            slug
            categories(pagination:{limit:-1}){
                data{
                  attributes{
                    name
                    slug
                    categories(pagination:{limit:-1}){
                        data{
                          attributes{
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
}`

export const GET_CATEGORY_METADATA = gql`
query getCategory($category:String!){
    categories(filters:{slug:{eq:$category}},sort:"name",pagination:{limit:-1}){
        data{
          attributes{
            name
            slug
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
            categories{
                data{
                    attributes{
                        name
                    }
                }
            }
          }
        }
    }
}`

export const GET_CATEGORY = gql`
query getCategory($category:String!){
    categories(filters:{slug:{eq:$category}},pagination:{limit:-1}){
        data{
            id
            attributes{
                name
                slug
                categories(pagination:{limit:-1}){
                    data{
                        attributes{
                            name
                            slug
                            categories(pagination:{limit:-1}){
                                data{
                                attributes{
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
}`

export const GET_CATEGORY_NAME = gql`
query getCategory($category:String!){
    categories(filters:{slug:{eq:$category}},pagination:{limit:-1}){
        data{
            id
            attributes{
                name
                slug
            }
        }
    }
}`

export const GET_CATEGORY_BRANDS = gql`
query getCategoryBrands($filters:BrandFiltersInput!){
    brands(filters:$filters,sort:"name",pagination:{limit:-1}){
        data{
          attributes{
            name
            slug
          }
        }
      }
}`

export const GET_NUMBER_OF_CATEGORY_BRAND_PRODUCTS = gql`
query getNumberOfCategoryBrandProducts($filters:ProductFiltersInput!){
    products(filters:$filters){
        meta{
          pagination{
            total
          }
        }
      }
}`

export const GET_CATEGORY_FILTERS = gql`
query getCategoryFilters($category:String!){
    categories(filters: { slug: { eq: $category } }) {
        data {
          attributes {
            filters {
              name
            }
          }
        }
      }
    
}`

export const GET_CATEGORY_INITIAL_FILTER_VALUES = gql`
query getCategoryFilters($filters:ProductFiltersInput!){
    products(filters:$filters,pagination: { limit: -1 }){
            data{
                attributes{
                    brand{
                        data{
                          attributes{
                            slug
                          }
                        }
                    }
                    prod_chars{
                        name
                        value
                    }
                }
            }
    }    
}`

export const GET_MENU = gql`
{
    categories(filters:{parents:{id:{eq:null}}},pagination:{limit:-1}){
        data{
          attributes{
            name
            slug
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
            categories(pagination:{limit:-1}){
                data{
                  attributes{
                    name
                    slug
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
                    categories(pagination:{limit:-1}){
                        data{
                          attributes{
                            name
                            slug
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
                        }
                    }
                  }
                }
            }
          }
        }
    }
}`
