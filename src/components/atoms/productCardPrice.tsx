'use client'
import { getPrices } from "@/lib/helpers/priceHelper";
import { ISimilarProductPage } from "@/lib/interfaces/product";
import { FaPhone } from "react-icons/fa6";

const ProductCardPrice = ({ product }: { product: ISimilarProductPage }) => {
  const price = product.price;
  const is_sale = product.is_sale;
  const salePrice = product.sale_price;
  const isAskForPrice = product.status === 'AskForPrice';

  const { profit, discount } = getPrices({ price: price, sale_price: salePrice });

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

  if (isAskForPrice) {
    return (
      <div className="flex justify-end items-center mt-3">
        <div className="bg-gradient-to-r from-siteColors-purple/10 to-siteColors-pink/10 dark:from-siteColors-purple/20 dark:to-siteColors-pink/20 p-2 rounded-lg border border-siteColors-purple/30 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-siteColors-purple dark:bg-siteColors-purple-light flex items-center justify-center">
                <FaPhone className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-siteColors-purple dark:text-siteColors-purple-light">
                Ζητήστε Τιμή
              </span>
            </div>

            {/* Αλλαγή από <a> σε <button> */}
            <button
              onClick={(e) => handleAction(e, 'tel')}
              aria-label="Καλέστε μας για προσφορά"
              className="text-xs bg-siteColors-purple text-white px-2 py-1 rounded hover:bg-siteColors-purple-dark transition-colors"
            >
              Καλέστε
            </button>
          </div>

          {/* Αλλαγή από <a> σε <button> ή <span> με onClick */}
          <button
            onClick={(e) => handleAction(e, 'mail')}
            aria-label="Στείλτε μας email για προσφορά"
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-siteColors-blue dark:hover:text-siteColors-lightblue hover:underline text-center block mt-1 truncate w-full"
          >
            info@magnetmarket.gr
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end items-center mt-3">
      {is_sale && salePrice ? (
        <div className="flex flex-col items-end">
          <span className="text-sm line-through text-gray-500 dark:text-slate-400 mb-1">
            {price.toFixed(2)} €
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-siteColors-purple dark:text-white">
              {salePrice.toFixed(2)} €
            </span>
          </div>
        </div>
      ) : (
        <span className="text-xl font-bold text-siteColors-purple dark:text-white">
          {price.toFixed(2)} €
        </span>
      )}
    </div>
  );
};

export default ProductCardPrice;