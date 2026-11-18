import { getAnnouncement } from "@/lib/queries/announcementQuery";
import Link from "next/link";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaFire
} from "react-icons/fa";
import AnnouncementClient from "./AnnouncementClient";

const Αnnouncement = async () => {
  const announcement = await getAnnouncement()

  if (!announcement)
    return null

  const { text, type = 'info', is_closable: isClosable = true, href, link_label, version } = announcement;

  // Determine styling based on announcement type
  const getStylesByType = () => {
    switch(type) {
      case 'warning':
        return {
          container: "bg-gradient-to-r from-amber-100 to-amber-50 border-l-4 border-amber-500 dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-400",
          icon: "text-amber-600 dark:text-amber-400",
          text: "text-amber-800 dark:text-amber-200"
        };
      case 'important':
        return {
          container: "bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500 dark:from-red-900/30 dark:to-red-800/20 dark:border-red-400",
          icon: "text-red-600 dark:text-red-400",
          text: "text-red-800 dark:text-red-200"
        };
      case 'event':
        return {
          container: "bg-gradient-to-r from-purple-100 to-purple-50 border-l-4 border-[#6e276f] dark:from-purple-900/30 dark:to-purple-800/20 dark:border-purple-400",
          icon: "text-[#6e276f] dark:text-purple-400",
          text: "text-[#6e276f] dark:text-purple-200"
        };
      default: // info
        return {
          container: "bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-[#246eb5] dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-400",
          icon: "text-[#246eb5] dark:text-blue-400",
          text: "text-[#24488f] dark:text-blue-200"
        };
    }
  };

  const styles = getStylesByType();

  const getIconByType = () => {
    switch(type) {
      case 'warning':
        return <FaExclamationTriangle className={`text-lg ${styles.icon}`} />;
      case 'important':
        return <FaFire className={`text-lg ${styles.icon}`} />;
      case 'event':
        return <FaCalendarAlt className={`text-lg ${styles.icon}`} />;
      default: // info
        return <FaInfoCircle className={`text-lg ${styles.icon}`} />;
    }
  };

  return (
    <AnnouncementClient closable={isClosable} version={version}>
      <div className={`relative p-4 shadow-md rounded-b-lg ${styles.container}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 mr-3 mt-0.5 ${styles.icon}`}>
            {getIconByType()}
          </div>
          <p className={`flex-1 font-medium ${styles.text}`}>
            {text}
            {href && (
              <Link href={href} className="ml-2 underline font-semibold">
                {link_label || 'Περισσότερα'}
              </Link>
            )}
          </p>
        </div>
      </div>
    </AnnouncementClient>
  );
}

export default Αnnouncement;