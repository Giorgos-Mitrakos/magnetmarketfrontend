import Image from "next/image";
import Visa from "../../../public//Visa_Brandmark_Blue_RGB_2021.png"
import Mastercard from "../../../public//mc_symbol_opt_73_3x.png"
import Maestro from "../../../public//ms_vrt_opt_pos_73_3x.png"

const EpayIcons = () => {
    return (
        <div className="flex justify-center items-center space-x-4 px-8 py-8">
            <Image src={Visa} alt="Visa" 
                height={32} />
            <Image src={Mastercard} alt="Mastercard" 
                height={48} />
            <Image src={Maestro} height={52} alt="Maestro"/>
        </div>
    );

}

export default EpayIcons