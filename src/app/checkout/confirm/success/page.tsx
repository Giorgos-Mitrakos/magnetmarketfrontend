
import { getCookies } from "@/lib/helpers/actions"
import { GET_ORDER } from "@/lib/queries/shippingQuery";
import { requestSSR } from "@/repositories/repository";
import { Metadata } from "next"
import Image from "next/image"

// Function to Add days to current date
function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

interface IOrderCookie {
  orderId: number
}

interface IOrder {
  order: {
    data: {
      id: number,
      attributes: {
        products: {
          id: number
          name: string,
          slug: string,
          image: string,
          price: number,
          weight: number,
          is_sale: boolean,
          quantity: number,
          sale_price: null,
          isAvailable: boolean
        }[],
        total: number,
        status: string,
        billing_address: {
          isInvoice: boolean,
          email: string,
          firstname: string,
          lastname: string,
          street: string,
          city: string,
          state: string,
          zipCode: string,
          country: string,
          telephone: string,
          mobilePhone: string,
          afm: string,
          doy: string,
          companyName: string,
          businessActivity: string,
        }
        different_shipping: boolean,
        shipping_address: {
          firstname: string,
          lastname: string,
          street: string,
          city: string,
          state: string,
          zipCode: string,
          country: string,
          telephone: string,
          mobilePhone: string,
        },
        installments: number
      },
    }
  }
}

export default async function Success() {

  const orderCookie = await getCookies({ name: 'magnet_market_order' })

  const order: IOrderCookie = orderCookie ? JSON.parse(orderCookie.value) : null

  const response = await requestSSR({
    query: GET_ORDER, variables: { id: order.orderId }
  });

  const data = response as IOrder

  const deliveryDate = new Date()
  const earlyDeviveryDate = addDays(deliveryDate, 3)
  const lateDeviveryDate = addDays(deliveryDate, 6)

  return (
    <section className="rounded-lg p-4 bg-gradient-to-tr from-siteColors-lightblue via-siteColors-blue to-siteColors-pink">
      <h1 className="text-2xl mb-4 font-semibold text-slate-200 text-center">Ευχαριστούμε για την παραγγελία!</h1>
      <h1 className="text-xl mb-4 font-semibold text-slate-200 text-center">Αρ. {data.order.data.id}</h1>
      <div className="grid md:grid-cols-4 gap-4">
        {data && data.order.data.attributes.products.map(item => (
          <div key={item.id} className="grid grid-cols-5 shadow-md rounded-md bg-white">
            <div className="flex justify-center items-center p-4 col-span-2">
              <Image
                key={item.id}
                src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                alt={item.name}
                height={120}
                width={120}

              />
            </div>
            <div className="flex flex-col justify-between col-span-3 p-4 space-y-2 text-gray-500">
              <h2 className="text-siteColors-purple font-semibold line-clamp-4 row-span-2">{item.name}</h2>
              <div className="flex flex-col">
                <div className="flex space-x-2">
                  <h3>Κωδικός:</h3>
                  <p className="text-left">{item.id}</p>
                </div>
                <div className="flex space-x-2">
                  <h3>Ποσότητα:</h3>
                  <p>{item.quantity}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg shadow-md p-4 mt-4 text-gray-500 bg-white">
        <div className="flex space-x-4">
          <h3>Πιθανή ημ/νια παράδοσης:</h3>
          <p>{earlyDeviveryDate.toLocaleDateString()} - {lateDeviveryDate.toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-4">
          <h3>Πληρωμή:</h3>
          <p>{data.order.data.attributes.total.toFixed(2)} €</p>
        </div>
      </div>
    </section>
  )

}

export const metadata: Metadata = {
  title: 'Magnetmarket - Ευχαριστούμε για την παραγγελία',
  description: 'Μην το ψάχνεις, εδώ θα βρείς τις καλύτερες τίμες και προσφορές σε υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις και άλλα προϊόντα.',
  keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
  alternates: {
    canonical: `${process.env.NEXT_URL}/checkout/confirm/success`,
  },
  openGraph: {
    url: 'www.magnetmarket.gr',
    type: 'website',
    images: [`${process.env.NEXT_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
    siteName: "www.magnetmarket.gr",
    emails: ["info@magnetmarket.gr"],
    phoneNumbers: ['2221121657'],
    countryName: 'Ελλάδα',
  }
}