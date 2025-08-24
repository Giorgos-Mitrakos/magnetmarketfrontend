import Image, { StaticImageData } from "next/image";
import PiraeusLogo from "../../../public/piraeus-logo-2024.png"
import NbgLogo from "../../../public/nbg-logo.svg"
import EurobankLogo from "../../../public/eurobank_logo.svg"
import AlphaBankLogo from "../../../public/alphaBank_logo.svg"

interface IbankProps {
    image: StaticImageData,
    iban: string,
    alt: string
    height: number
}

const Bank = ({ image, alt, iban, height }: IbankProps) => {


    return (
        <div className="flex flex-col sm:flex-row items-center dark:text-slate-900">
            <p className="flex h-6 w-20 mr-4 align-baseline">
                <Image
                    src={image}
                    alt={alt}
                    height={height}>
                </Image>
            </p>
            <p>
                {iban}
            </p>
        </div>
    )
}

const Banks = () => {


    return (
        <div className="p-4 space-y-4 w-full">
            <Bank
                image={PiraeusLogo}
                alt="Piraeus Logo"
                iban="GR3701715790006579154658301"
                height={68} />
            <Bank
                image={NbgLogo}
                alt="ΕΘΝΙΚΗ Logo"
                iban="GR7601102660000026600449974"
                height={68} />
            <Bank
                image={EurobankLogo}
                alt="Eurobank Logo"
                iban="GR1302604580000460200699254"
                height={68} />
            <Bank
                image={AlphaBankLogo}
                alt="AlphaBank Logo"
                iban="GR7701402330233002002027191"
                height={68} />
        </div>
    )
}

export default Banks;