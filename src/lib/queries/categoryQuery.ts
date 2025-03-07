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

export interface IcategoriesMappingProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                categories: {
                    data: {
                        attributes: {
                            name: string
                            slug: string
                            categories: {
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
        }[]
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


export interface IcategoryMetadataProps {
    categories: {
        data: [{
            attributes: {
                name: string
                slug: string
                image: { data: IImageAttr }
                categories: {
                    data: {
                        attributes: {
                            name: string
                        }
                    }[]
                }
            }
        }]
    }
}

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

export interface IcategoryNameProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
            }
        }[]
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
        data: {
            attributes: IProductBrand & IProdChar[]
        }[]
    }
}

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

export interface IMenuSub2CategoryProps {
    data: {
        attributes: {
            name: string
            slug: string
            image: {
                data: {
                    attributes: {
                        url: string
                        alternativeText: string
                    }
                }
            }
        }
    }[]
}

export interface IMenuSubCategoryProps {
    data: {
        attributes: {
            name: string
            slug: string
            image: {
                data: {
                    attributes: {
                        url: string
                        alternativeText: string
                    }
                }
            }
            categories: IMenuSub2CategoryProps
        }
    }[]
}

export interface IMenuProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                image: {
                    data: {
                        attributes: {
                            url: string
                            alternativeText: string
                        }
                    }
                }
                categories: IMenuSubCategoryProps
            }
        }[]
    }
}