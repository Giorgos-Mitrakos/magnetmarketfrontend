import Image from "next/image";
import EpayIcon from "../../../public/epay_icons.png"

const EpayIcons = () => {
    return (
        <div className="flex justify-center bg-[#559be3] items-center space-x-4 px-8 ">
            <Image src={EpayIcon} alt="Visa" 
                height={64} />
        </div>
    );

}

export default EpayIcons