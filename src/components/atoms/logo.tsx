import Image from 'next/image'
import Link from 'next/link'
import logo from '../../../public/MARKET MAGNET-LOGO.svg'

export default function Logo() {
    return (
        <Link href="/" className='flex relative place-self-center lg:place-self-start justify-center lg:justify-start xs:h-full w-full xs:w-auto xs:max-w-xs'
            aria-label='Σύνδεσμος προς αρχική σελίδα'>
            <Image
                priority
                src={logo}
                aria-label="Λογότυπο του Magnet Market. Η τεχνολογία στο δικό σου πεδίο!"
                alt="Logo Magnet Market"
            />
        </Link>
    )
}