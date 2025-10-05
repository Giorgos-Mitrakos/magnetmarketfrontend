'use client'

import UserOrders from "@/components/molecules/userOrders";
import ProfileAddresses from "@/components/organisms/profileAddresses";
import { useApiRequest } from "@/repositories/clientRepository";
import { signOut, useSession } from "next-auth/react";
import { useReducer } from "react";
import { 
  AiOutlineAppstore, 
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineLoading3Quarters,
  AiOutlineSetting 
} from "react-icons/ai";

// Types
interface Tab {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface TabState {
  tabs: Tab[];
  activeTab: number;
}

type TabAction = { type: 'SET_ACTIVE_TAB'; payload: number };

// Reducer
const tabReducer = (state: TabState, action: TabAction): TabState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
};

const tabs: Tab[] = [
  { title: 'Το Προφίλ μου', content: "Profile", icon: <AiOutlineUser className="text-lg" /> },
  { title: 'Οι Παραγγελίες μου', content: 'Orders', icon: <AiOutlineAppstore className="text-lg" /> },
];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <AiOutlineLoading3Quarters className="animate-spin text-2xl text-siteColors-purple" />
    <span className="ml-2 text-gray-600 dark:text-gray-300">Φόρτωση...</span>
  </div>
);

const TabContent = ({ 
  id, 
  activeTab, 
  children 
}: { 
  id: string; 
  activeTab: string; 
  children: React.ReactNode;
}) => {
  return activeTab === id ? (
    <div className="animate-fade-in">
      {children}
    </div>
  ) : null;
};

const TabContentList = ({ state, session }: { state: TabState; session: any }) => {
  const { data, loading, error } = useApiRequest({
    method: 'POST', 
    api: "/api/user-address/getUser", 
    jwt: session?.user?.jwt 
  });

  if (loading) return <LoadingSpinner />;
  
  if (error) return (
    <div className="text-center py-8 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
      Σφάλμα φόρτωσης δεδομένων προφίλ
    </div>
  );

  const activeTabContent = state.tabs[state.activeTab]?.content;

  return (
    <div className="w-full">
      <TabContent id="Profile" activeTab={activeTabContent}>
        <div className="space-y-6">
          <ProfileAddresses 
            key={data?.user?.info.id}
            userInfo={data?.user?.info}
            billingAddress={data?.user?.billing_address}
            shippingAddress={data?.user?.shipping_address}
            jwt={session.user.jwt} 
          />
        </div>
      </TabContent>
      
      <TabContent id="Orders" activeTab={activeTabContent}>
        <UserOrders jwt={session.user.jwt} />
      </TabContent>
    </div>
  );
};

export default function Account() {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(tabReducer, { tabs, activeTab: 0 });

  const handleTabClick = (index: number) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: index });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AiOutlineSetting className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            Παρακαλώ συνδεθείτε για να δείτε τον λογαριασμό σας
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ο Λογαριασμός μου
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Διαχειριστείτε τα προσωπικά σας στοιχεία και τις παραγγελίες σας
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <div className="space-y-2">
                {state.tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                      state.activeTab === index
                        ? 'bg-siteColors-purple text-white shadow-md transform scale-105'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1'
                    }`}
                    onClick={() => handleTabClick(index)}
                  >
                    <span className="flex-shrink-0">{tab.icon}</span>
                    <span className="ml-3 font-medium text-left">{tab.title}</span>
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    className="w-full flex items-center p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 group"
                    onClick={() => signOut()}
                  >
                    <AiOutlineLogout className="text-lg flex-shrink-0" />
                    <span className="ml-3 font-medium group-hover:underline">Αποσύνδεση</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <TabContentList state={state} session={session} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}