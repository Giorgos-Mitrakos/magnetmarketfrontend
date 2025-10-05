
// import FooterSection from "../molecules/footerSection"
import { FaRegClock } from "react-icons/fa";
import { AiOutlineMail, AiOutlinePhone } from "react-icons/ai";
import { FaLocationDot, FaInstagram, FaFacebookF } from "react-icons/fa6";
import Link from "next/link";
import EpayIcons from "../molecules/epayIcons";
import Copyright from "../atoms/copyright";
import { HTMLAttributeAnchorTarget } from "react";
import { getFooter } from "@/lib/queries/footerQuery";

export interface FooterSectionProps {
  label: string;
  links:
  {
    id: number,
    label: string,
    isLink: boolean,
    href: string,
    target: HTMLAttributeAnchorTarget
  }[]

}

const FooterSection = (props: FooterSectionProps) => {
  return (
    <div className="flex flex-col space-y-4 text-white">
      <h2 className="text-lg uppercase font-semibold tracking-wide pb-2 border-b border-siteColors-pink/30" aria-label={props.label}>
        {props.label}
      </h2>
      <ul className="space-y-3">
        {props.links.map((link) => (
          <li key={link.id} className="w-auto">
            {link.isLink ? (
              <Link
                href={link.href}
                target={link.target}
                className="relative inline-block py-1 font-medium after:duration-300 after:absolute after:content-[''] after:h-[2px] after:bg-white after:w-0 hover:after:w-full after:left-0 after:-bottom-0 after:rounded-xl transition-all hover:text-siteColors-pink"
                aria-label={link.label}
              >
                {link.label}
              </Link>
            ) : (
              <span className="py-1 inline-block font-medium" aria-label={link.label}>
                {link.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};


const Footer = async () => {
  const data = await getFooter();

  if (!data)
    return <div></div>

  return (
      <footer className="bg-gradient-to-b pb-36 md:pb-4 from-siteColors-blue from-10% to-siteColors-purple to-100% text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Contact Information */}
            <div className="lg:col-span-2">
              <h2 className="text-xl uppercase font-bold mb-6 tracking-wide pb-2 border-b border-siteColors-pink/30">
                Επικοινωνία
              </h2>
              <ul className="space-y-5">
                <li className="flex items-start space-x-4">
                  <div className="bg-siteColors-pink p-2 rounded-full flex-shrink-0">
                    <FaRegClock className="text-lg text-white" aria-label="Ρολόι" />
                  </div>
                  <span className="font-medium pt-1" aria-label={`Ωράριο Λειτουργίας: ${data.opening_hours}`}>
                    Ωράριο Λειτουργίας: {data.opening_hours}
                  </span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="bg-siteColors-pink p-2 rounded-full flex-shrink-0">
                    <AiOutlinePhone className="text-lg text-white" aria-label="Τηλέφωνο" />
                  </div>
                  <a
                    href={`tel:${data.telephone}`}
                    className="hover:text-siteColors-pink font-bold transition-colors pt-1"
                    aria-label={data.telephone}
                  >
                    {data.telephone}
                  </a>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="bg-siteColors-pink p-2 rounded-full flex-shrink-0">
                    <FaLocationDot className="text-lg text-white" aria-label="Πινέζα" />
                  </div>
                  <span className="font-medium pt-1" aria-label={`Οδός: ${data.address}, Πόλη: ${data.city}, Ταχυδρομικός κωδικός: ${data.postcode}`}>
                    {data.address} <br /> {data.city}, {data.postcode}
                  </span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="bg-siteColors-pink p-2 rounded-full flex-shrink-0">
                    <AiOutlineMail className="text-lg text-white" aria-label="Φάκελος" />
                  </div>
                  <a
                    href={`mailto:${data.email}`}
                    className="break-all hover:text-siteColors-pink font-bold transition-colors pt-1"
                    aria-label={`Email: ${data.email}`}
                  >
                    {data.email}
                  </a>
                </li>
              </ul>
            </div>

            {/* Footer Sections */}
            {data.sections.map((x) => (
              <div key={x.id}>
                <FooterSection label={x.Label} links={x.links} />
              </div>
            ))}

            {/* Social Media */}
            <div>
              <h2 className="text-lg uppercase font-semibold tracking-wide pb-2 border-b border-siteColors-pink/30">Ακολουθήστε μας</h2>
              <p className="my-4 text-gray-100">Μείνετε συνδεδεμένοι μαζί μας για ενημερώσεις και προσφορές!</p>
              <div className="flex space-x-4 mt-6">
                <Link
                  href="https://www.facebook.com/magnetmarket.gr/"
                  target="_blank"
                  className="bg-siteColors-pink p-3 rounded-full text-white hover:bg-white hover:text-siteColors-pink transition-colors shadow-md"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-xl" />
                </Link>
                <Link
                  href="https://www.instagram.com/magnetmarket.gr/"
                  target="_blank"
                  className="bg-siteColors-pink p-3 rounded-full text-white hover:bg-white hover:text-siteColors-pink transition-colors shadow-md"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-xl" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <EpayIcons />
        <Copyright />
      </footer>
  );
};

export default Footer