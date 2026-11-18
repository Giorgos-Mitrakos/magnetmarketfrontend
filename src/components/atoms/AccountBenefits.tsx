// Τα οφέλη του λογαριασμού πελάτη — κοινή λίστα για τις σελίδες σύνδεσης και εγγραφής.
// Για να προσθέσετε/αλλάξετε κάτι, αρκεί να πειράξετε τον πίνακα BENEFITS.
import { FiTruck, FiHeart, FiPercent, FiTrendingDown, FiBell, FiShield, FiPackage } from 'react-icons/fi'
import type { IconType } from 'react-icons'

const BENEFITS: { icon: IconType; title: string; text: string }[] = [
    {
        icon: FiTruck,
        title: 'Γρήγορη ολοκλήρωση αγορών',
        text: 'Αποθηκευμένες διευθύνσεις αποστολής και στοιχεία τιμολόγησης — χωρίς να τα πληκτρολογείτε κάθε φορά',
    },
    {
        icon: FiPackage,
        title: 'Όλες οι παραγγελίες σας σε ένα σημείο',
        text: 'Ιστορικό και κατάσταση κάθε παραγγελίας, μαζί και όσων κάνατε ως επισκέπτης με το ίδιο email',
    },
    {
        icon: FiHeart,
        title: 'Λίστα αγαπημένων',
        text: 'Αποθηκεύστε προϊόντα και βρείτε τα από οποιαδήποτε συσκευή',
    },
    {
        icon: FiTrendingDown,
        title: 'Ειδοποίηση πτώσης τιμής',
        text: 'Σας στέλνουμε email μόλις πέσει η τιμή σε προϊόν που σας ενδιαφέρει',
    },
    {
        icon: FiBell,
        title: 'Ειδοποίηση διαθεσιμότητας',
        text: 'Μάθετε πρώτοι πότε ένα εξαντλημένο προϊόν είναι ξανά διαθέσιμο',
    },
    {
        icon: FiPercent,
        title: 'Προσφορές & κουπόνια',
        text: 'Ενημερωθείτε πρώτοι για τις προσφορές μας και τα εκπτωτικά κουπόνια',
    },
    {
        icon: FiShield,
        title: 'Ασφάλεια στοιχείων',
        text: 'Ο λογαριασμός σας προστατεύεται με επιβεβαίωση email και κρυπτογραφημένο κωδικό',
    },
]

export default function AccountBenefits() {
    return (
        <ul className="space-y-4">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start">
                    <span className="mr-4 mt-0.5 flex-shrink-0 rounded-full bg-siteColors-lightblue p-2">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-blue-200">{text}</p>
                    </div>
                </li>
            ))}
        </ul>
    )
}
