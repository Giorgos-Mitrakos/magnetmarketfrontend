import Image from 'next/image'
import logo from '../../../public/MARKET MAGNET-LOGO.svg'

export default function LoadingLogo() {
    return (
        <div className="fixed top-0 left-0 content-center w-full h-full z-50 backdrop:filter backdrop-blur-lg bg-opacity-10 bg-white ">
            <p className="flex justify-center">
                <Image
                    priority
                    src={logo}
                    aria-label="Λογότυπο του Magnet Market. Η τεχνολογία στο δικό σου πεδίο!"
                    alt="Logo Magnet Market"
                />
            </p>
        </div>
    )
}