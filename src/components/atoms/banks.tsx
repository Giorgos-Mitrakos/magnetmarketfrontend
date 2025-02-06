import Image from "next/image";

interface IbankProps {
    image: string,
    iban: string,
    alt: string
    width: number,
    height: number
}

const Bank = ({ image, alt, iban, width, height }: IbankProps) => {


    return (
        <div className="flex flex-col sm:flex-row items-center">
            <p className="flex h-6 mr-4 align-baseline">
                <Image
                    src={image}
                    alt={alt}
                    width={width}
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
                image="/piraeus-logo-2024.png"
                alt="Piraeus Logo"
                iban="GR3701715790006579154658301"
                width={80}
                height={36} />
            <Bank
                image="/nbg-logo.svg"
                alt="ΕΘΝΙΚΗ Logo"
                iban="GR7601102660000026600449974"
                width={80}
                height={44} />
            <Bank
                image="/eurobank_logo.svg"
                alt="Eurobank Logo"
                iban="GR1302604580000460200699254"
                width={80}
                height={44} />
            <Bank
                image="/alphaBank_logo.svg"
                alt="AlphaBank Logo"
                iban="GR7701402330233002002027191"
                width={80}
                height={44} />
        </div>
    )
}

export default Banks;