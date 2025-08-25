import Image from "next/image";
import EpayIcon from "../../../public/epay_icons.png"


const EpayIcons = () => {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white font-bold text-sm mb-3">Ασφαλείς Μέθοδοι Πληρωμής</span>
      <div className="bg-white p-3 rounded-lg shadow">
        <Image 
          src={EpayIcon} 
          alt="Payment methods" 
          height={48} 
          className="h-12 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default EpayIcons