import Image from 'next/image';
import EpayIcon from "../../../public/epay_icons.png"

export default function PaymentSecurityBadges() {
  return (
    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600 dark:text-slate-200 mb-3">
        Ασφαλής πληρωμή με
      </p>
      <div className="flex justify-center items-center">
        {/* Replace with your actual image path */}
        <Image
          src={EpayIcon}
          alt="Secure payment methods: VISA, Mastercard ID Check, and VISA Secure"
          height={68}
          className="object-contain"
        />
      </div>
    </div>
  );
}