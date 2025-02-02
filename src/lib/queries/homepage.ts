import { gql } from "graphql-request";
import { string } from "yup";
import { IimageProps } from "./categoryQuery";

export const GET_HOMEPAGE = gql`
{
    homepage {
    data {
      attributes {
        Carousel {
          __typename
          ... on ComponentGlobalBanner {
            id
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
            link_label
            href
            target
          }
        }
        fixed_hero_banners {
          __typename
          ... on ComponentGlobalBanner {
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
            link_label
            href
            target
          }
        }
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
                  brand {
                    data {
                      attributes {
                        logo {
                          data {
                            attributes {
                              name
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
                        url
                        alternativeText
                        width
                        height
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
                        alternativeText
                      }
                    }
                  }
                }
              }
            }
          }
          ...on ComponentHomepageBrandsBanner{
            id
            brands{
              data{
                id
                attributes{
                  name
                  slug
                  logo{
                    data{
                      attributes{
                        name
                        alternativeText
                        url
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

export interface IHomepageProps {
  homepage: {
    data: {
      attributes: {
        Carousel: ICarousel[]
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
          category: {
            data: {
              attributes: {
                name: string
              }

            }
            title: string
            subtitle: string
            image: {
              data: {
                attributes: {
                  name: string
                  alternativeText: string
                  url: string
                }
              }
            }
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