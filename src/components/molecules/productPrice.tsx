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
import { PreorderPassView } from '@/lib/interfaces/preorder';
import type { ProductPerks } from '@/components/organisms/productBasicFeatures';
import { useCheckout } from '@/context/checkout';
import { getAvailabilityClasses, getAvailabilityInfo } from '@/lib/helpers/availabilityHelper';
import { FaCircleInfo } from 'react-icons/fa6';
import DeliveryEstimate from '@/components/atoms/deliveryEstimate';
import type { IDeliveryEstimate } from '@/lib/interfaces/product';

// Ίδια μορφή με τις τιμές του site (44.90 €)
const euro = (n: number) => `${n.toFixed(2)} €`;

/** Επεξήγηση διαθεσιμότητας ανά κατάσταση (εικονίδιο ⓘ δίπλα στην ένδειξη) */
const AVAILABILITY_INFO: Partial<Record<string, string>> = {
  Backorder:
    'Το προϊόν το παραγγέλνουμε από τον προμηθευτή μόλις ολοκληρώσετε την παραγγελία σας. Θα επικοινωνήσουμε μαζί σας για τον χρόνο παράδοσης.',
  IsExpected:
    'Το προϊόν δεν είναι διαθέσιμο αυτή τη στιγμή, αλλά αναμένεται. Πατήστε «Πότε το περιμένετε;» για να σας ενημερώσουμε.',
};

/** ⓘ με επεξήγηση: hover/focus στον υπολογιστή, πάτημα στο κινητό */
function InfoTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-slate-500 hover:text-siteColors-blue dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-siteColors-lightblue"
        aria-label={`Τι σημαίνει «${label}»;`}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <FaCircleInfo className="w-4 h-4" aria-hidden="true" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg dark:bg-slate-700"
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** Ένδειξη διαθεσιμότητας σε έντονο «badge» (πριν χανόταν ως απλό κείμενο) */
function AvailabilityBadge({ product }: { product: IProductPage }) {
  const info = getAvailabilityInfo(product.status, product.inventory, product.is_in_house);
  if (!info.message) return null;
  const help = AVAILABILITY_INFO[product.status];
  return (
    <div className="mt-3 flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${getAvailabilityClasses(info.color)}`}
        aria-label={`Διαθεσιμότητα: ${info.message}`}
      >
        <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
        {info.message}
      </span>
      {help && <InfoTip text={help} label={info.message} />}
    </div>
  );
}

function ProductPrice({ product, preorder = null, perks = null, delivery = null }: {
  product: IProductPage
  preorder?: PreorderPassView | null
  perks?: ProductPerks | null
  delivery?: IDeliveryEstimate | null
}) {
  const [showAskForPriceModal, setShowAskForPriceModal] = useState(false);
  const [showNotifyMeModal, setShowNotifyMeModal] = useState(false);
  const [showExpectedDateModal, setShowExpectedDateModal] = useState(false);
  const { checkout } = useCheckout();

  const { profit, discount } = getPrices({
    price: product.price,
    sale_price: product.sale_price
  });
  const hasDiscount = product.is_sale && product.sale_price;
  // (2026-11-19) Χωρίς τιμή (brand «Ζητήστε τιμή», σε όποια κατάσταση) = όπως το «Ζητήστε τιμή»
  const isAskForPrice = product.status === 'AskForPrice' || product.price == null;
  const isOutOfStock = product.status === 'OutOfStock';
  const IsExpected = product.status === 'IsExpected';
  const isBackorder = product.status === 'Backorder';
  const preorderValid = IsExpected && preorder?.valid === true;
  const effectivePrice = hasDiscount ? product.sale_price : product.price;
  // (2026-10-22) Δωρεάν μεταφορικά με βάση και το καλάθι: πόσα λείπουν μαζί με αυτό το προϊόν
  const cartAmount = (checkout.cart ?? []).reduce(
    (sum, i) => sum + (i.is_sale && i.sale_price ? i.sale_price : i.price) * i.quantity,
    0
  );
  const inCart = (checkout.cart ?? []).some(i => i.id === product.id);
  const amountWithThis = inCart ? cartAmount : cartAmount + (effectivePrice || 0);
  const shippingLeft = perks?.freeShipping ? Math.max(0, Math.round((perks.freeShipping.over - amountWithThis) * 100) / 100) : null;
  const canBuy = !isAskForPrice && !isOutOfStock && product.status !== 'Discontinued' && (!IsExpected || preorderValid);
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

          {/* (2026-10-22) Ένδειξη ΦΠΑ + χαμηλότερη τιμή 30 ημερών (Omnibus) */}
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Η τιμή περιλαμβάνει ΦΠΑ 24%</span>
          {hasDiscount && product.lowest30BeforeSale != null && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Χαμηλότερη τιμή των 30 ημερών πριν την έκπτωση: {euro(product.lowest30BeforeSale)}
            </span>
          )}

          {/* (2026-10-23) Διαθεσιμότητα: έντονη, ακριβώς κάτω από την τιμή */}
          <AvailabilityBadge product={product} />
          {/* Σημείωση από τον Product Manager για την επαναφορά αποθέματος */}
          {(IsExpected || isBackorder || isOutOfStock) && product.expected_restock_note && (
            <p className="mt-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
              {product.expected_restock_note}
            </p>
          )}

          {/* (2026-10-23) Εκτιμώμενη παράδοση (διακόπτης στον Product Manager) */}
          {canBuy && delivery && <DeliveryEstimate delivery={delivery} />}

          {/* Δόσεις / δωρεάν μεταφορικά */}
          {canBuy && perks && (perks.freeInstallments > 1 || perks.maxInstallments > 1 || perks.freeShipping) && (
            <ul className="mt-2 space-y-0.5 text-sm text-slate-600 dark:text-slate-300">
              {/* Έντοκες δόσεις: μόνο ο μέγιστος αριθμός, χωρίς ποσά/επιτόκιο (αυτά στο ταμείο) */}
              {perks.freeInstallments > 1 ? (
                <li>
                  ή έως <strong>{perks.freeInstallments} άτοκες δόσεις</strong> των {euro(effectivePrice / perks.freeInstallments)} με κάρτα
                  {perks.maxInstallments > perks.freeInstallments && (
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Ή έως {perks.maxInstallments} δόσεις με τόκο — το ποσό τους φαίνεται στο ταμείο
                    </span>
                  )}
                </li>
              ) : perks.maxInstallments > 1 ? (
                <li>Δυνατότητα πληρωμής έως {perks.maxInstallments} δόσεις με κάρτα (με τόκο)</li>
              ) : null}
              {perks.freeShipping && shippingLeft != null && (
                <li>
                  {shippingLeft <= 0 ? (
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      {cartAmount > 0 && !inCart ? 'Μαζί με το καλάθι σας: δωρεάν' : 'Δωρεάν'} αποστολή
                      {perks.freeShipping.name ? ` (${perks.freeShipping.name})` : ''}
                    </span>
                  ) : cartAmount > 0 ? (
                    <>Μαζί με το καλάθι σας λείπουν <strong>{euro(shippingLeft)}</strong> για δωρεάν αποστολή</>
                  ) : (
                    <>Δωρεάν αποστολή{perks.freeShipping.name ? ` (${perks.freeShipping.name})` : ''} για αγορές από {euro(perks.freeShipping.over)}</>
                  )}
                </li>
              )}
            </ul>
          )}


          {/* (2026-10-22) Προσωπικός σύνδεσμος προπαραγγελίας για «Αναμένεται» */}
          {IsExpected && preorder?.valid && (
            <div className="mt-4 p-3 rounded-lg border border-green-300 bg-green-50 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200">
              <p className="font-semibold">Ειδική διάθεση για εσάς: μπορείτε να το προπαραγγείλετε.</p>
              {preorder.note && <p className="mt-1">{preorder.note}</p>}
              <p className="mt-1 text-xs">
                Έως {preorder.maxQuantity} {preorder.maxQuantity === 1 ? 'τεμάχιο' : 'τεμάχια'}
                {preorder.expiresAt ? ` · ισχύει έως ${new Date(preorder.expiresAt).toLocaleDateString('el-GR')}` : ''}
                {preorder.emailBound ? ' · ολοκληρώστε την παραγγελία με το email που μας δώσατε' : ''}.
              </p>
            </div>
          )}
          {IsExpected && preorder && !preorder.valid && (
            <p className="mt-4 p-3 rounded-lg border border-amber-300 bg-amber-50 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
              {preorder.message}
            </p>
          )}

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
          {IsExpected && !preorderValid && (
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