'use client'
import { useState } from 'react';
import { getPrices } from "@/lib/helpers/priceHelper";
import { IProductPage } from "@/lib/interfaces/product";
import ProductAvailability from "@/components/atoms/productAvailability";
import { FaPhone, FaEnvelope, FaBell } from "react-icons/fa6";
import AskForPriceModal from "@/components/modals/AskForPriceModal";
import NotifyMeModal from "@/components/modals/NotifyMeModal";
import { FaCalendarAlt } from 'react-icons/fa';
import ExpectedDateModal from '../modals/ExpectedDateModal';

function ProductPrice({ product }: { product: IProductPage }) {
  const [showAskForPriceModal, setShowAskForPriceModal] = useState(false);
  const [showNotifyMeModal, setShowNotifyMeModal] = useState(false);
  const [showExpectedDateModal, setShowExpectedDateModal] = useState(false);

  const { profit, discount } = getPrices({
    price: product.price,
    sale_price: product.sale_price
  });
  const hasDiscount = product.is_sale && product.sale_price;
  const isAskForPrice = product.status === 'AskForPrice';
  const isOutOfStock = product.status === 'OutOfStock';
  const IsExpected = product.status === 'IsExpected';
  const showNotifyButton = isOutOfStock;

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
      <>
        <div className="mt-6">
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col mt-4">
                <button
                  onClick={() => setShowAskForPriceModal(true)}
                  className="flex items-center justify-center gap-2 bg-siteColors-purple hover:bg-siteColors-purple-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <FaEnvelope className="w-4 h-4" />
                  Ζητήστε Τιμή
                </button>
              </div>
            </div>
            <ProductAvailability
              status={product.status}
              inventory={product.inventory}
              isInHouse={product.is_in_house}
              variant="text"
              className="mt-3"
            />
          </div>
        </div>

        <AskForPriceModal
          isOpen={showAskForPriceModal}
          onClose={() => setShowAskForPriceModal(false)}
          productName={product.name}
          productId={product.id}
        />
      </>
    );
  }

  // Κανονική τιμή
  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Price Display */}
        <div className="flex flex-col flex-1">
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

          {/* Notify Button - Βελτιωμένο styling */}
          {showNotifyButton && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowNotifyMeModal(true)}
                className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-900 border-2 border-siteColors-purple dark:border-siteColors-purple-light text-siteColors-purple dark:text-gray-200 hover:bg-siteColors-purple/5 dark:hover:bg-siteColors-purple/10 font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <FaBell className="w-4 h-4" />
                <span>Ειδοποιήστε με όταν είναι διαθέσιμο</span>
              </button>

              {/* Προαιρετική μικρή περιγραφή */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Θα λάβετε email μόλις επανέλθει σε διαθεσιμότητα
              </p>
            </div>
          )}
          {/* Expected Date Button (IsExpected) - ΝΕΟ */}
          {IsExpected && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowExpectedDateModal(true)}
                className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-900 border-2 border-siteColors-purple dark:border-siteColors-purple-light text-siteColors-purple dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <FaCalendarAlt className="w-4 h-4" />
                <span>Πότε το περιμένετε;</span>
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Ενημερωθείτε για την ημερομηνία διαθεσιμότητας
              </p>
            </div>
          )}
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

      <NotifyMeModal
        isOpen={showNotifyMeModal}
        onClose={() => setShowNotifyMeModal(false)}
        productName={product.name}
        productId={product.id}
      />

      <ExpectedDateModal
        isOpen={showExpectedDateModal}
        onClose={() => setShowExpectedDateModal(false)}
        productName={product.name}
        productId={product.id}
      />
    </div>
  );
}

export default ProductPrice;