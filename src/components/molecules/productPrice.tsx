import { getPrices } from "@/lib/helpers/priceHelper";
import { IProduct } from "@/lib/interfaces/product";


function ProductPrice(props: { product: IProduct }) {
    const {  profit, discount } = getPrices({ price: props.product.attributes.price, sale_price: props.product.attributes.sale_price })

    return (
        <div className="hidden md:block mt-8 h-32">
            <div className="flex space-x-12">
                <div className="flex justify-start items-center text-siteColors-purple dark:text-slate-200 xs:text-xl font-semibold">
                    <div className="flex flex-col">
                        <h5 className="text-sm  text-slate-500 dark:text-slate-300" aria-label="Τιμή">Τιμή</h5>
                        {props.product.attributes.is_sale && props.product.attributes.sale_price ?
                            <div className="flex flex-col">
                                <h3 className="text-sm line-through align-top mr-1 text-gray-500 dark:text-slate-400"
                                    aria-label={`${props.product.attributes.price.toFixed(2)} €`}>{props.product.attributes.price.toFixed(2)} €</h3>
                                <h2 className="text-2xl font-bold dark:text-slate-200"
                                    aria-label={`${props.product.attributes.sale_price.toFixed(2)} €`}>{props.product.attributes.sale_price.toFixed(2)} €</h2>
                            </div>
                            : <span className="text-2xl font-bold"
                                aria-label={`${props.product.attributes.price.toFixed(2)} €`}>
                                {props.product.attributes.price.toFixed(2)} €</span>}
                        <h4 className="text-base text-green-800 dark:text-green-400"
                            aria-label="Παράδοση σε 1–3 ημέρες">
                            {props.product.attributes.inventory > 0 && props.product.attributes.is_in_house ?
                                'Άμεσα διαθέσιμο' : "Παράδοση σε 1 – 3 ημέρες"}</h4>
                    </div>
                </div>
                {discount && profit && props.product.attributes.is_sale &&
                    <div className="relative hidden md:block md:hover:animate-wiggle">
                        <div className="flex h-24 w-24 text-white leading-6 text-center justify-center items-center bg-siteColors-pink rounded-full
                            before:shadow-discountPrice before:content-[''] before:absolute before:top-10 before:left-10 before:w-4 before:h-4 before:rounded-full"><br />
                            <p>
                                <span className="font-semibold"
                                    aria-label={profit < 50 ? 'Έκπτωση' : 'Κέρδος'}>{profit < 50 ? 'Έκπτωση' : 'Κέρδος'}</span><br />
                                <span className="text-lg font-bold"
                                    aria-label={`${profit < 50 ? `${discount.toFixed(2)} %` : `${profit.toFixed(2)} €`}`}>{profit < 50 ? `${discount.toFixed(2)} %` : `${profit.toFixed(2)} €`}</span><br />
                            </p>
                        </div>
                    </div>}
            </div>
        </div>
    )
}

export default ProductPrice