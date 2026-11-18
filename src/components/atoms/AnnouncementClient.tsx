// components/AnnouncementClient.tsx
"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AnnouncementClientProps {
  children: React.ReactNode;
  closable?: boolean;
  /** Αλλάζει με κάθε αλλαγή της ανακοίνωσης → ξαναεμφανίζεται μία νέα ανακοίνωση */
  version?: string;
}

const STORAGE_KEY = 'announcementClosed';

const AnnouncementClient = ({ children, closable = true, version = '' }: AnnouncementClientProps) => {
  const [isVisible, setIsVisible] = useState(true);

  // Κρύβεται μόνο αν ο επισκέπτης έκλεισε ΑΥΤΗ την ανακοίνωση
  useEffect(() => {
    if (!closable) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === version) setIsVisible(false);
    } catch {
      // localStorage μη διαθέσιμο (π.χ. ιδιωτική περιήγηση) — απλώς εμφανίζεται
    }
  }, [closable, version]);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch {
      // αγνοείται
    }
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
