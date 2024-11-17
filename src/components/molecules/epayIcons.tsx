import Image from "next/image";
import Visa from "../../../public//Visa_Brandmark_Blue_RGB_2021.png"
import Mastercard from "../../../public//mc_symbol_opt_73_3x.png"
import Maestro from "../../../public//ms_vrt_opt_pos_73_3x.png"

const EpayIcons = () => {
    return (
        <div className="flex justify-end items-center m-4 space-x-4 mb-16">
            <Image src={Visa} alt="Visa" 
                height={32} />
            <Image src={Mastercard} alt="Mastercard" 
                height={48} />
            <Image src={Maestro} height={52} alt="Maestro"/>
        </div>
    );

}

export default EpayIcons