import Image from 'next/image'
import Link from 'next/link'
import logo from '../../../public/MARKET MAGNET-LOGO.png'

export default function Logo() {
    return (
        <Link href="/" className='flex relative items-center lg:place-self-start justify-center lg:justify-start xs:h-full w-full xs:w-auto xs:max-w-xs
        my-4'
            aria-label='Σύνδεσμος προς αρχική σελίδα'>
            <Image
                className='object-contain'
                priority
                src={logo}
                width={240}
                height={100}
                aria-label="Λογότυπο του Magnet Market. Η τεχνολογία στο δικό σου πεδίο!"
                alt="Logo Magnet Market"
            />
        </Link>
    )
}