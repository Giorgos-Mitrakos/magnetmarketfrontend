'use client'

import Addresses from "@/components/molecules/addresses";
import UserInfo from "@/components/molecules/userInfo";
import Profile from "@/components/organisms/profileTabContent";
import { useApiRequest } from "@/repositories/clientRepository";
import { signOut, useSession } from "next-auth/react";
import { ReactNode, useReducer, useState } from "react";
import { AiOutlineAppstore, AiOutlineHistory, AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import { FaCoins } from "react-icons/fa6";


const reducer = (state: { tabs: { title: string, content: string, icon: ReactNode }[], activeTab: number }, action: { type: string, payload: number }) => {
    switch (action.type) {
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
        default:
            return state;
    }
};

const TabContent = ({ id, activeTab, children }: { id: string, activeTab: string, children: JSX.Element }) => {
    return (
        activeTab === id ? <div className="TabContent">
            {children}
        </div>
            : null
    );
};

const tabs = [
    { title: 'Το Προφίλ μου', content: "Profile", icon: <AiOutlineUser /> },
    { title: 'Διευθύνσεις Χρέωσης', content: 'BillingAddresses', icon: <AiOutlineUser /> },
    { title: 'Διευθύνσεις Αποστολής', content: 'ShippingAddresses', icon: <AiOutlineUser /> },
    { title: 'Παραγγελίες', content: 'Orders', icon: <AiOutlineAppstore /> },
    { title: 'Οι πόντοι μου', content: 'MyPoints', icon: <FaCoins /> },
    { title: 'Είδα Πρόσφατα', content: 'Recently', icon: <AiOutlineHistory /> }
]

const TabContentList = ({ state, session }: any) => {
    interface IProfile {
        user: {
            info: {
                firstName: string;
                lastName: string;
                email: string
                telephone: string,
                mobilePhone: string
            },
            shipping_address: {
                id: number,
                firstname: string,
                lastname: string,
                street: string,
                city: string,
                state: string,
                zipCode: number,
                country: string,
                afm: number,
                doy: string,
                companyName: string,
                businessActivity: string,
                title: string,
                isInvoice: boolean
            }[],
            billing_address: {
                id: number,
                firstname: string,
                lastname: string,
                street: string,
                city: string,
                state: string,
                zipCode: number,
                country: string,
                afm: number,
                doy: string,
                companyName: string,
                businessActivity: string,
                title: string,
                isInvoice: boolean
            }[]
        }
    }

    const { data, loading, error }: { data: IProfile, loading: boolean, error: any } = useApiRequest({ api: "/api/user-address/getUser", jwt: `${session.user.jwt}` })

    return (
        <>
            {loading && !data ? <div>Loading</div> :
                <div className="w-full text-center">
                    <TabContent id="Profile" activeTab={state.tabs[state.activeTab]?.content}>
                        <UserInfo user={session?.user} info={data.user.info} />
                    </TabContent>
                    <TabContent id="BillingAddresses" activeTab={state.tabs[state.activeTab]?.content}>
                        <div className="grid grid-cols-2">
                            {data?.user.billing_address.map(address => (
                                <Addresses key={address.id} address={address} type="billing" />
                            ))}
                        </div>
                    </TabContent>
                    <TabContent id="ShippingAddresses" activeTab={state.tabs[state.activeTab]?.content}>
                        <div className="grid grid-cols-2">
                            {data?.user.shipping_address.map(address => (
                                <Addresses key={address.id} address={address} type="shipping" />
                            ))}
                        </div>
                    </TabContent>
                    <TabContent id="Orders" activeTab={state.tabs[state.activeTab]?.content}>
                        <p>Tab Orders!</p>
                    </TabContent>
                    <TabContent id="MyPoints" activeTab={state.tabs[state.activeTab]?.content}>
                        <p>Tab MyPoints!</p>
                    </TabContent>
                    <TabContent id="Recently" activeTab={state.tabs[state.activeTab]?.content}>
                        <p>Tab Recently!</p>
                    </TabContent>
                </div>}
        </>)
}

export default function Account() {

    const { data: session, status } = useSession()
    const [state, dispatch] = useReducer(reducer, {
        tabs, activeTab: 0
    });

    const handleTabClick = (index: number) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: index });
    };

    return (
        <div className="flex">
            <ul className=" text-siteColors-purple min-w-fit bg-slate-100">
                {state.tabs.map((tab, index) => (
                    <li
                        className=" border-b-2 border-r-2 p-4"
                        key={index}
                        onClick={() => handleTabClick(index)}
                    >
                        <p className=" hidden text-left sm:block">{tab.title}</p>
                        <p className="flex text-2xl sm:hidden text-left">{tab.icon}</p>
                    </li>))}
                <li className="border p-4 flex flex-col justify-start">
                    <button className=" text-siteColors-lightblue justify-start" onClick={() => signOut()}>
                        <p className=" hidden sm:flex">Sign out</p>
                        <AiOutlineLogout className="sm:hidden text-2xl" />
                    </button>
                    {/* <button className=" text-siteColors-lightblue sm:hidden" onClick={() => signOut()}><AiOutlineLogout /></button> */}
                </li>
            </ul>
            <TabContentList state={state} session={session} />
        </div>
    )
}