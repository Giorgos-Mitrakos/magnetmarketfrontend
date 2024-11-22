import Image from 'next/image'
import logo from '../../../public/MARKET MAGNET-LOGO.svg'

export default function LoadingLogo() {
    return (
        <div className="flex justify-center w-full h-full bg-white dark:bg-black">
        <Image
            priority
            src={logo}
            aria-label="Λογότυπο του Magnet Market. Η τεχνολογία στο δικό σου πεδίο!"
            alt="Logo Magnet Market"
        />
    </div>
    )
}