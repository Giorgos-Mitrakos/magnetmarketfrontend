import { gql } from "graphql-request";

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

export interface IcategoriesMappingProps {
    categories: {
        data: [{
            attributes: {
                name: string
                slug: string
                categories: {
                    data: [{
                        attributes: {
                            name: string
                            slug: string
                            categories: {
                                data: [{
                                    attributes: {
                                        name: string
                                        slug: string
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


export interface IcategoryChildsProps {
    categories: {
        data: [{
            attributes: {
                name: string
                slug: string
                categories: {
                    data: [{
                        attributes: {
                            name: string
                            slug: string
                            categories: {
                                data: [{
                                    attributes: {
                                        name: string
                                        slug: string
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
                    formats
                    url
                  }
                }
            }
          }
        }
    }
}`

export interface IimageProps {
    name: string
    hash: string
    ext: string
    mime: string
    path: string
    width: number
    height: number
    size: number
    url: string
}

export interface IcategoryMetadataProps {
    categories: {
        data: [{
            attributes: {
                name: string
                slug: string
                image: {
                    data: {
                        attributes: {
                            formats: {
                                thumbnail: IimageProps
                                medium: IimageProps
                                small: IimageProps
                            }
                            url: string
                        }
                    }
                }
            }
        }]
    }
}

export const GET_CATEGORY = gql`
query getCategory($category:String!){
    categories(filters:{slug:{eq:$category}},sort:"name",pagination:{limit:-1}){
        data{
            id
            attributes{
                name
                slug
                categories(sort:"name",pagination:{limit:-1}){
                    data{
                        attributes{
                            name
                            slug
                            categories(sort:"name",pagination:{limit:-1}){
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

export interface IcategoryProps {
    categories: {
        data: [{
            attributes: {
                name: string
                slug: string
                categories: {
                    data: [{
                        attributes: {
                            name: string
                            slug: string
                            categories: {
                                data: [{
                                    attributes: {
                                        name: string
                                        slug: string
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

export interface IcategoryBrandsProps {
    brands: {
        data: [{
            attributes: {
                name: string
                slug: string
                numberOfItems: number
            }
        }]
    }
}

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

export interface IcategoryFiltersProps {
    categories: {
        data: [{
            attributes: {
                filters: [{
                    name: string
                }]
            }
        }]
    }
}

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

export interface IcategoryFilterValuesProps {
    products: {
        data: [{
            attributes: {
                brand: {
                    data: {
                        attributes: {
                            slug: string
                        }
                    }
                }
                prod_chars: [{
                    name: string
                    value: string
                }]
            }
        }]
    }
}