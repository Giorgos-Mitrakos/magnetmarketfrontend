import { getPrices } from "@/lib/helpers/priceHelper";
import { IProductPage } from "@/lib/interfaces/product";

function ProductPrice({ product }: { product: IProductPage }) {
  const { profit, discount } = getPrices({ 
    price: product.price, 
    sale_price: product.sale_price 
  });

  const hasDiscount = product.is_sale && product.sale_price;

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Price Display */}
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 dark:text-slate-300 mb-1">Τιμή</span>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm line-through text-gray-500 dark:text-slate-400">
                  {product.price.toFixed(2)} €
                </span>
                <span className="text-2xl md:text-3xl font-bold text-siteColors-purple dark:text-slate-200">
                  {product.sale_price.toFixed(2)} €
                </span>
              </>
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-siteColors-purple dark:text-slate-200">
                {product.price.toFixed(2)} €
              </span>
            )}
          </div>
          
          {/* Availability */}
          <span className={`text-sm mt-1 ${
            product.inventory > 0 && product.is_in_house 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {product.inventory > 0 && product.is_in_house 
              ? 'Άμεσα διαθέσιμο' 
              : 'Παράδοση σε 1–3 ημέρες'}
          </span>
        </div>

        {/* Discount/Profit Badge */}
        {hasDiscount && discount && profit && (
          <div className="flex-shrink-0">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center bg-gradient-to-br from-siteColors-pink to-siteColors-purple text-white rounded-full shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-xs font-semibold">
                  {profit < 50 ? 'ΈΚΠΤΩΣΗ' : 'ΚΕΡΔΟΣ'}
                </span>
                <span className="text-lg font-bold mt-1">
                  {profit < 50 ? `${discount.toFixed(0)}%` : `${profit.toFixed(2)}€`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductPrice;