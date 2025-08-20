'use client';

import { useSearchParams } from 'next/navigation';

export default function UnsubscribeErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Προέκυψε κάποιο σφάλμα κατά τη διαγραφή.';

  return (
    <div className="bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Σφάλμα Διαγραφής</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>

        <div className="space-y-3">
          <a
            href="mailto:support@magnetmarket.gr"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Επικοινωνία με Support
          </a>
          
          <a
            href="/"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Επιστροφή στην Αρχική
          </a>
        </div>
      </div>
    </div>
  );
}