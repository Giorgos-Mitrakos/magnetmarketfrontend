// components/AnnouncementClient.tsx
"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AnnouncementClientProps {
  children: React.ReactNode;
  closable?: boolean;
}

const AnnouncementClient = ({ children, closable = true }: AnnouncementClientProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    // Optional: Store in localStorage to persist across sessions
    localStorage.setItem('announcementClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative">
      {children}
      {closable && (
        <button 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Κλείσιμο ενημέρωσης"
          onClick={handleClose}
        >
          <FaTimes size={16} />
        </button>
      )}
    </div>
  );
};

export default AnnouncementClient;