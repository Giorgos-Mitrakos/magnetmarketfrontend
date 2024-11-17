"use client"

import useProductPrice from "@/hooks/useProductPrice";


function ProductPrice(props: { id: number }) {
    const { profit, discount, isSale, isLoading, error, data } = useProductPrice(props.id)


    return (
        <div className="hidden md:block mt-8 h-32">
            {isLoading ?
                <div className="flex justify-start items-center animate-pulse h-7 mt-4">
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </div>
                : error ? <div>Error...</div> :
                    <div className="flex space-x-12">
                        <div className="flex justify-start items-center text-siteColors-purple xs:text-xl font-semibold">
                            <div className="flex flex-col">
                                <h5 className="text-sm  text-slate-500 dark:text-slate-300" aria-label="Τιμή">Τιμή</h5>
                                {data?.product.data.attributes.is_sale && data?.product.data.attributes.sale_price?
                                    <div className="flex flex-col">
                                        <h2 className="text-2xl font-bold dark:text-slate-300" 
                                        aria-label={`${data?.product.data.attributes.sale_price.toFixed(2)} €`}>{data?.product.data.attributes.sale_price.toFixed(2)} €</h2>
                                        <h3 className="text-sm line-through align-top mr-1 text-gray-500 dark:text-slate-400"
                                        aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>{data?.product.data.attributes.price.toFixed(2)} €</h3>
                                    </div>
                                    : <span className="text-2xl font-bold"
                                    aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>
                                        {data?.product.data.attributes.price.toFixed(2)} €</span>}
                                <h4 className="text-base text-green-0 dark:text-slate-300"
                                aria-label={`${data?.product.data.attributes.status}`}>
                                    {data?.product.data.attributes.status}</h4>
                            </div>
                        </div>
                        {!isLoading && discount && profit && isSale &&
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
            }</div>
    )
}

export default ProductPrice