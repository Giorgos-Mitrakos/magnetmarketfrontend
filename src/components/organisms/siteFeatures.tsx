import { SignKeyObjectInput } from "crypto";
import SiteFeature from "../molecules/siteFeature";
import { FaRotate, FaRegCreditCard, FaRegComments } from "react-icons/fa6";
import { AiOutlineSafety } from "react-icons/ai";

export interface SiteFeatureProps {
    siteFeatures: SiteFeatureProps[]
}

const features = [
    {
        icon: < FaRotate aria-label="Δύο βέλη που σχηματίζουν κύκλο και δείχνουν προς αντίθετες κατευθύνσεις" />,
        "aria-label": "Δωρεάν επιστροφή",
        "aria-description": "Δωρεάν επιστροφή για ελαττωματικά προϊόντα",
        header: "Δωρεάν Επιστροφή",
        content: "Για ελαττωματικά προϊόντα",
    },
    {
        icon: < FaRegCreditCard aria-label="Πιστωτική κάρτα" />,
        "aria-label": "Πληρωμές με κάρτα",
        "aria-description": "Ασφαλείς πληρωμές με κάρτα",
        header: "Πληρωμές με κάρτα",
        content: "Ασφαλείς πληρωμές",
    },
    {
        icon: < FaRegComments aria-label="Συνεφάκια ομιλίας" />,
        "aria-label": "Τεχνική Υποστήριξη",
        "aria-description": "Τεχνική Υποστήριξη 10:00 - 18:00",
        header: "Τεχνική Υποστήριξη",
        content: "10:00 - 18:00",
    },
    {
        icon: < AiOutlineSafety aria-label="Ασπίδα" />,
        "aria-label": "Εγγύηση",
        "aria-description": "Τα προϊόντα έρχονται με εγγύηση Ελληνικής Αντιπροσωπείας",
        header: "Εγγύηση",
        content: "Ελληνικής Αντιπροσωπείας",
    }
]

const SiteFeatures = () => {
    {
        return (
            <section aria-label="Παροχές του καταστήματος" className="w-full overflow-hidden  bg-slate-100 dark:bg-slate-700">
                <div className="flex min-w-fit justify-between animate-scroll-text-horizontal lg:animate-none">
                    {features.map(x => (
                        <SiteFeature key={x.header}
                            icon={x.icon}
                            aria-label={x["aria-label"]}
                            aria-description={x["aria-description"]}
                            header={x.header}
                            content={x.content} />
                    ))}
                </div>
            </section>
        )
    }
}

export default SiteFeatures;