import { requestSSR } from "@/repositories/repository";
import FooterSection from "../molecules/footerSection"
import { GET_FOOTER, IfooterProps } from "@/lib/queries/footerQuery";
import { FaRegClock } from "react-icons/fa";
import { AiOutlineMail, AiOutlinePhone } from "react-icons/ai";
import { FaLocationDot, FaInstagram, FaFacebookF } from "react-icons/fa6";
import Link from "next/link";

async function getFooter(): Promise<IfooterProps> {
    const data = await requestSSR({
        query: GET_FOOTER
    });

    return data as IfooterProps
}

const Footer = async () => {

    const response = await getFooter()

    const data = response.footer.data.attributes

    return (
        <footer className="flex flex-wrap py-4 bg-gradient-to-b from-siteColors-lightblue from-10%  to-siteColors-blue to-90% justify-between px-2 xs:px-4 sm:px-6 md:px-8">
            <address className="not-italic text-white space-y-4 mr-8 mb-8">
                <h2 className='text-lg uppercase font-semibold'
                    aria-label="Επικοινωνία">Επικοινωνία</h2>
                <ul className="space-y-4">
                    <li key={1} className="flex items-start space-x-2">
                        <FaRegClock className="text-2xl" aria-label="Ρολόι" />
                        <span aria-label={`Ωράριο Λειτουργίας: ${data.opening_hours}`}>Ωράριο Λειτουργίας: {data.opening_hours}</span>
                    </li>
                    <li key={2} className="flex items-start space-x-2 hover:text-siteColors-pink font-semibold">
                        <AiOutlinePhone className="text-2xl" aria-label="Τηλέφωνο" />
                        <a href={`tel:${data.telephone}`} aria-label={data.telephone}>{data.telephone}</a>
                    </li>
                    <li key={3} className="flex items-start space-x-2">
                        <FaLocationDot className="text-2xl" aria-label="Πινέζα" />
                        <span
                            aria-label={`Οδός: ${data.address}, Πόλη: ${data.city}, Ταχυδρομικός κωδικός: ${data.postcode}`}>
                            {data.address} <br /> {data.city}, {data.postcode}</span>
                    </li>
                    <li key={4} className="flex items-start space-x-2 font-semibold hover:text-siteColors-pink">
                        <AiOutlineMail className="text-2xl" aria-label="Φάκελος" />
                        <a href={`mailto:${data.email}`} className="break-all"
                            aria-label={`Email: ${data.email}`}>{data.email}</a>
                    </li>
                    <li key={5} className="flex items-start space-x-2 font-semibold">
                        <h3>Ακολουθήστε μας</h3>
                        <Link href="https://www.facebook.com/magnetmarket.gr/" target="_blank" className=" hover:text-siteColors-pink">
                            <FaFacebookF className="text-2xl" aria-label="Instagram" />
                        </Link>
                        <Link href="https://www.instagram.com/magnetmarket.gr/" target="_blank" className=" hover:text-siteColors-pink">
                            <FaInstagram className="text-2xl" aria-label="Facebook" />
                        </Link>
                    </li>
                </ul >
            </address>
            {data.sections.map(x => (
                <FooterSection key={x.id} label={x.Label} links={x.links} />
            ))}
        </footer>
    )
}

export default Footer