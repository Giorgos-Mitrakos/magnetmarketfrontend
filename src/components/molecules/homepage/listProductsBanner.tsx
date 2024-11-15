import Carousel from "@/components/atoms/carousel";
import { IimageProps } from "@/lib/queries/categoryQuery";

const ListProductsBanner = ({ id, title, subtitle, products }: { 
    id: string,
    title: string, 
    subtitle: string, 
    products:{data: [{
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
      }]} }) => {

    return (
        <section key={id} className='my-4 py-4 rounded bg-gradient-to-b from-siteColors-purple via-siteColors-pink to-siteColors-lightblue px-2 sm:px-2'>
            <h2 className="  py-4 text-center text-white text-xs xs:text-lg md:text-3xl font-bold">{title}</h2>
            <Carousel products={products} />
        </section> 
    )
}

export default ListProductsBanner;