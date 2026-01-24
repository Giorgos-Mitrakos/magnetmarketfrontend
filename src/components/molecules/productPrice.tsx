'use client'
import { getPrices } from "@/lib/helpers/priceHelper";
import { IProductPage } from "@/lib/interfaces/product";
import ProductAvailability from "@/components/atoms/productAvailability"; // ✅ Import
import { FaPhone } from "react-icons/fa6";

function ProductPrice({ product }: { product: IProductPage }) {
  const { profit, discount } = getPrices({
    price: product.price,
    sale_price: product.sale_price
  });
  const hasDiscount = product.is_sale && product.sale_price;
  const isAskForPrice = product.status === 'AskForPrice';

  // Handler για αποφυγή του εξωτερικού Link
  const handleAction = (e: React.MouseEvent, type: 'tel' | 'mail') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'tel') {
      window.location.href = "tel:2221121657";
    } else {
      window.location.href = "mailto:info@magnetmarket.gr";
    }
  };

  // Αν είναι AskForPrice, επιστροφή μόνο του μηνύματος
  if (isAskForPrice) {
    return (
      <div className="mt-6">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 dark:text-slate-300 mb-1">Τιμή</span>
          <div className="bg-gradient-to-r from-siteColors-purple/10 to-siteColors-pink/10 dark:from-siteColors-purple/20 dark:to-siteColors-pink/20 p-4 rounded-lg border border-siteColors-purple/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-siteColors-purple dark:bg-siteColors-purple-light flex items-center justify-center">
                <FaPhone className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-siteColors-purple dark:text-siteColors-purple-light">
                  Ζητήστε Τιμή
                </span>
                <button
                  onClick={(e) => handleAction(e, 'mail')}
                  aria-label="Στείλτε μας email για προσφορά"
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-siteColors-blue dark:hover:text-siteColors-lightblue hover:underline text-center block mt-1 truncate w-full"
                >
                  info@magnetmarket.gr
                </button>
                <div className="text-xs text-gray-600 dark:text-gray-400 hover:text-siteColors-blue dark:hover:text-siteColors-lightblue block mt-1 truncate w-full">
                  <span>Τηλ:</span>
                  <button
                    onClick={(e) => handleAction(e, 'tel')}
                    aria-label="Καλέστε μας για προσφορά"
                    
                  >
                    2221121657
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* <ProductAvailability
            status={product.status}
            inventory={product.inventory}
            isInHouse={product.is_in_house}
            variant="text"
            className="mt-1"
          /> */}
        </div>
      </div>
    );
  }

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

          {/* ✅ Χρήση του νέου ProductAvailability component με variant="text" */}
          <ProductAvailability
            status={product.status}
            inventory={product.inventory}
            isInHouse={product.is_in_house}
            variant="text"
            className="mt-1"
          />
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