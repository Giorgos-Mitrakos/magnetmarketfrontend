import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import ProductPrice from "../molecules/productPrice"
import ProductAddToCart from "../molecules/productAddToCart"

export interface ProductProps {
  product: {
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
  }
}

const ProductBasicFeatures = ({ product }: ProductProps) => {

  return (
    <div className="flex flex-col p-4">
      <div className="flex h-8 relative">
        {product.attributes.brand.data.attributes.logo.data !== null ? <Image className="flex object-contain object-left"
          aria-label={`Λογότυπο της εταιρίας ${product.attributes.brand.data.attributes.name}`}
          src={getStrapiMedia(product.attributes.brand.data.attributes.logo.data.attributes.url)}
          fill
          // width={36}
          // height={36}
          alt="Test"
        /> :
          <h2 className="text-xl text-slate-500 font-bold uppercase"
            aria-label={`Εταιρία: ${product.attributes.brand.data.attributes.name}`}>{product.attributes.brand.data.attributes.name}</h2>
        }
      </div>
      <h1 className="text-xl sm:text-2xl text-siteColors-purple font-semibold"
        aria-label={`Τίτλος: ${product.attributes.name}`}>{product.attributes.name}</h1>
      <h5 className="text-sm text-slate-500"
        aria-label={`Κωδικός Προϊόντος ${product.id}`}>Κωδικός: {product.id}</h5>
      <h5 className="text-sm text-slate-500"
        aria-label={`Part Number: ${product.attributes.mpn}`}>MPN: {product.attributes.mpn}</h5>
      <h5 className="text-sm text-slate-500"
        aria-label={`Barcode: ${product.attributes.barcode}`}>EAN: {product.attributes.barcode}</h5>
      <h2 aria-label="Περιγραφή">{product.attributes.short_description}</h2>
      <ProductPrice id={product.id} />
      <ProductAddToCart product={product} />
    </div>
  )

}

export default ProductBasicFeatures;