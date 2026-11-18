import Image from 'next/image'
import Link from 'next/link'
import logo from '../../../public/MARKET MAGNET-LOGO.png'

export default function Logo() {
    return (
        <Link href="/" className='flex relative items-center lg:place-self-start justify-center lg:justify-start xs:h-full w-full xs:w-auto xs:max-w-xs
        my-4'
            aria-label='Σύνδεσμος προς αρχική σελίδα'>
            {/* (2026-10-28) Το λογότυπο είναι 629×182 → στα 240px πλάτος έχει ύψος 69px
                (με height 100 το CSS άλλαζε το ύψος και η Next.js έβγαζε προειδοποίηση) */}
            <Image
                className='object-contain'
                priority
                src={logo}
                width={240}
                height={69}
                aria-label="Λογότυπο του Magnet Market. Η τεχνολογία στο δικό σου πεδίο!"
                alt="Logo Magnet Market"
            />
        </Link>
    )
}