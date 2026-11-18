// (2026-10-26) Η σελίδα του λογαριασμού είναι client component — ο τίτλος και το
// noindex μπαίνουν εδώ.
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ο λογαριασμός μου | Magnet Market',
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
