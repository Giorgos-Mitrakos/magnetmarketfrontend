'use client'
 
import { useSearchParams  } from 'next/navigation'


const PiraeusGateway = () => {

    const searchParams = useSearchParams ()

    const peiraeus = searchParams.get('peiraeus')

    return (
        <div>Test:{peiraeus}</div>
    )
}

export default PiraeusGateway