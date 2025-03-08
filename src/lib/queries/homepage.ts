import { gql } from "graphql-request";
import { IImageAttr } from "../interfaces/image";
import { IProdChar } from "../interfaces/product";

export const GET_HOMEPAGE = gql`
{
    homepage {
    data {
      attributes {        
        body {
          __typename
          ... on ComponentHomepageBannerListProducts {
            title
            subtitle
            products {
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
                  brand {
                    data {
                      attributes {
                        name
                        slug
                        logo {
                          data {
                            attributes {
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
                  image {
                    data {
                      attributes {
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
          }
          ... on ComponentHomepageCategoryBanner {
            category {
              data {
                attributes {
                  name
                }
              }
            }
            title
            subtitle
            image {
              data {
                attributes {
                  name
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
          }
          ... on ComponentHomepageSingleBanner {
            singleBanner{
              data{
                attributes{
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
            href
            target
          }
          ... on ComponentHomepageDoubleBanner {
            rightBanner{
              data{
                attributes{
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
            rightHref
            rightTarget
            leftBanner{
              data{
                attributes{
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
            leftHref
            leftTarget
          }
          ... on ComponentHomepageTripleBanner {
            rightTripleBanner{
              data{
                attributes{
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
            rightTripleHref
            rightTripleTarget
            middleTripleBanner{
              data{
                attributes{
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
            middleTripleHref
            middleTripleTarget
            leftTripleBanner{
              data{
                attributes{
                  alternativeText
                  url
                  width
                  height
                }
              }
            }
            leftTripleHref
            leftTripleTarget
          }
          ... on ComponentHomepageHotOrSale {
            title
            type
          }
          ...on ComponentHomepageCategoriesBanner{
            categories(pagination:{limit:-1}){
              data{
                id
                attributes{
                  name
                  slug
                  parents{
                    data{
                      attributes{
                        slug
                        parents{
                          data{
                            attributes{
                              slug
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
                        name
                        alternativeText
                        formats
                      }
                    }
                  }
                }
              }
            }
          }
          ...on ComponentHomepageBrandsBanner{
            id
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
          }
          ...on ComponentGlobalCarousel{
            Banner{
              image{
                data{
                  attributes{
                    url
                    name
                    alternativeText
                    formats
                  }
                }
              }
              backgroundColor
              link_label
              href
              target
              title
              text_body
            }
          }
        }
      }
    }
  }
}`

export interface IHomepageProps {
  homepage: {
    data: {
      attributes: {
        // Carousel: ICarousel[]
        fixed_hero_banners: IFixedHeroBanners[]
        body: {
          __typename: string
          title: string
          subtitle: string
          products: {
            data: [{
              id: number
              attributes: {
                name: string
                slug: string
                prod_chars: IProdChar[]
                brand: {
                  data: {
                    attributes: {
                      name: string,
                      slug: string,
                      logo: { data: IImageAttr }
                    }
                  }
                }
                image: { data: IImageAttr }
              }
            }]
          }
          category: {
            data: {
              attributes: {
                name: string
              }

            }
            title: string
            subtitle: string
            image: { data: IImageAttr }
          }
        }
      }
    }
  }
}

export interface IFixedHeroBanners {
  __typename: string
  image: {
    data: {
      attributes: {
        name: string
        alternativeText: string
        url: string
      }
    }
  }

  link_label: string
  href: string
  target: string
}

export interface ICarousel {
  __typename: string,
  id: string,
  image: {
    data: {
      attributes: {
        name: string
        alternativeText: string
        url: string
      }
    }
  }
  link_label: string
  href: string
  target: string
}