// (2026-10-28) Next.js 16: το `next lint` καταργήθηκε — το ESLint τρέχει μόνο του
// (`npm run lint`) με τη νέα μορφή ρυθμίσεων (flat config). Αντικαθιστά το .eslintrc.json.
// Σημ.: το `next build` ΔΕΝ τρέχει πλέον lint — τρέξτε `npm run lint` όταν θέλετε έλεγχο.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'analyze/**', 'next-env.d.ts'],
  },
  {
    rules: {
      // Νέοι κανόνες του React Compiler (eslint-plugin-react-hooks 7). Δεν χρησιμοποιούμε
      // τον compiler, οπότε μένουν ως προειδοποιήσεις — όχι λάθη — όπως ήταν και πριν.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      // Στα σημεία αυτά το <a> είναι σκόπιμο (πλήρης φόρτωση σελίδας μετά την πληρωμή κ.λπ.)
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
]

export default config
