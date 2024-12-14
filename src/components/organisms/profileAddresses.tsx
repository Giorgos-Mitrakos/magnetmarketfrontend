"use client"
import { useFormik } from "formik"
import * as Yup from 'yup'
import Radio from "../atoms/radio"
import CustomInput from "../atoms/input"
import { forwardRef, useContext, useImperativeHandle, useState } from "react"
import { IProfile } from "@/app/checkout/customer-informations/page"
import { useNoRevalideteQuery, useQuery } from "@/repositories/clientRepository"
import { GET_COUNTRY_LIST, GET_COUNTRY_STATES, GET_REGION_POSTALS, GET_STATE_REGIONS } from "@/lib/queries/addressQuery"
import { ShippingContext } from "@/context/shipping"

export type FormInputRef = {
    submitForm: () => void;
    isSubmitting: boolean
};

interface IUserInfo {
    id: string,
    username: string,
    email: string
}

interface ICustomerInfo {
    id: number | string
    // email: string;
    firstname: string;
    lastname: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    telephone: string;
    mobilePhone: string;
    afm: string;
    doy: string;
    companyName: string;
    businessActivity: string;
    isInvoice: boolean | string;
    different_shipping?: boolean;
    // ship_firstname: string;
    // ship_lastname: string;
    // ship_street: string;
    // ship_city: string;
    // ship_state: string;
    // ship_zipCode: string;
    // ship_country: string;
    // ship_telephone: string;
    // ship_mobilePhone: string;
    // deliveryNotes: string
}

interface ICountries {
    countries: {
        data: {
            id: number | string
            attributes: {
                name: string
            }
        }[]
    }
}

interface IStates {
    countries: {
        data: {
            id: number | string
            attributes: {
                name: string
                states: {
                    data: {
                        id: number | string
                        attributes: {
                            name: string
                        }
                    }[]
                }
            }
        }[]
    }
}

interface IRegions {
    states: {
        data: {
            id: number | string
            attributes: {
                name: string
                regions: {
                    data: {
                        id: number | string
                        attributes: {
                            name: string
                        }
                    }[]
                }
            }
        }[]
    }
}

interface IRegionPostals {
    regions: {
        data: {
            id: number | string
            attributes: {
                name: string
                postal_codes: {
                    data: {
                        id: number | string
                        attributes: {
                            postal: string
                        }
                    }[]
                }
            }
        }[]
    }
}

const ProfileAddresses = ({ userInfo, billingAddress, shippingAddress, jwt }: {
    userInfo: IUserInfo,
    billingAddress: ICustomerInfo | null,
    shippingAddress: ICustomerInfo | null,
    jwt: string
}) => {

    const { data: countriesData, loading, error } = useNoRevalideteQuery({ query: GET_COUNTRY_LIST, jwt: '' })

    const countries = countriesData as ICountries

    let initialValues = {
        id: userInfo?.id,
        username: userInfo?.username,
        email: userInfo?.email,
        firstname: billingAddress?.firstname || "",
        lastname: billingAddress?.lastname || "",
        street: billingAddress?.street || "",
        city: billingAddress?.city || "",
        state: billingAddress?.state || "",
        zipCode: billingAddress?.zipCode || "",
        country: billingAddress?.country || "Ελλάδα",
        telephone: billingAddress?.telephone || "",
        mobilePhone: billingAddress?.mobilePhone || "",
        afm: billingAddress?.afm || "",
        doy: billingAddress?.doy || "",
        companyName: billingAddress?.companyName || "",
        businessActivity: billingAddress?.businessActivity || "",
        isInvoice: billingAddress?.isInvoice.toString() || "false",
        different_shipping: shippingAddress !== null ? true : false,
        ship_firstname: shippingAddress?.firstname || "",
        ship_lastname: shippingAddress?.lastname || "",
        ship_street: shippingAddress?.street || "",
        ship_city: shippingAddress?.city || "",
        ship_state: shippingAddress?.state || "",
        ship_zipCode: shippingAddress?.zipCode || "",
        ship_country: shippingAddress?.country || "Ελλάδα",
        ship_telephone: shippingAddress?.telephone || "",
        ship_mobilePhone: shippingAddress?.mobilePhone || "",
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            isInvoice: Yup.boolean(),
            email: Yup.string().email('*Παρακαλώ ελέγξε το email!').required('*Yποχρεωτικό πεδίο!'),
            country: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            street: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            city: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            state: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            zipCode: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            mobilePhone: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            firstname: Yup.string().when("isInvoice", {
                is: false,
                then: (schema) => schema.required('*Τό Όνομα είναι υποχρεωτικό πεδίο!')
            }),
            lastname: Yup.string().when("isInvoice", {
                is: false,
                then: (schema) => schema.required('*Τό Επίθετο είναι υποχρεωτικό πεδίο!')
            }),
            companyName: Yup.string().when("isInvoice", {
                is: true,
                then: (schema) => schema.required('*Η επωνυμία της εταιρίας είναι υποχρεωτικό πεδίο!')
            }),
            businessActivity: Yup.string().when("isInvoice", {
                is: true,
                then: (schema) => schema.required('*Η δραστηριότητα της εταιρίας είναι υποχρεωτικό πεδίο!')
            }),
            afm: Yup.string().when("isInvoice", {
                is: true,
                then: (schema) => schema.required('*Τό Α.Φ.Μ. της εταιρίας είναι υποχρεωτικό πεδίο!')
            }),
            doy: Yup.string().when("isInvoice", {
                is: true,
                then: (schema) => schema.required('*Η Δ.Ο.Υ. της εταιρίας είναι υποχρεωτικό πεδίο!')
            }),
            ship_firstname: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Τό Όνομα είναι υποχρεωτικό πεδίο!')
            }),
            ship_lastname: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Τό Επίθετο είναι υποχρεωτικό πεδίο!')
            }),
            ship_street: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
            ship_city: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
            ship_state: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
            ship_zipCode: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
            ship_country: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
            ship_mobilePhone: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
        }),
        onSubmit: async (values) => {
            const addresses = {
                different_shipping: values.different_shipping,
                user: {
                    id: values.id,
                    email: values.email,
                    username: values.username
                },
                billing: {
                    isInvoice: values.isInvoice,
                    firstname: values.firstname,
                    lastname: values.lastname,
                    street: values.street,
                    city: values.city,
                    state: values.state,
                    zipCode: values.zipCode,
                    country: values.country,
                    telephone: values.telephone,
                    mobilePhone: values.mobilePhone,
                    afm: values.afm,
                    doy: values.doy,
                    companyName: values.companyName,
                    businessActivity: values.businessActivity,

                },
                shipping: {
                    firstname: values.ship_firstname,
                    lastname: values.ship_lastname,
                    street: values.ship_street,
                    city: values.ship_city,
                    state: values.ship_state,
                    zipCode: values.ship_zipCode,
                    country: values.ship_country,
                    telephone: values.ship_telephone,
                    mobilePhone: values.ship_mobilePhone,
                }
            }

            const myHeaders = new Headers();

            myHeaders.append('Content-Type', 'application/json')
            myHeaders.append("Authorization", `Bearer ${jwt}`);

            const myInit = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({ addresses })
            };


            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-address/updateUser`,
                myInit,
            )
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
        }
    });

    const { data: stateData, loading: loadingState, error: errorState } = useQuery({ query: GET_COUNTRY_STATES, variables: { country: formik.values.country }, jwt: '' })
    const { data: regionData, loading: loadingRegions, error: errorRegions } = useQuery({ query: GET_STATE_REGIONS, variables: { state: formik.values.state }, jwt: '' })
    const { data: postalData, loading: loadingPostals, error: errorPostals } = useQuery({ query: GET_REGION_POSTALS, variables: { region: formik.values.city }, jwt: '' })

    const { data: shipStateData, loading: loadingShipState, error: errorShipState } = useQuery({ query: GET_COUNTRY_STATES, variables: { country: formik.values.ship_country }, jwt: '' })
    const { data: shipRegionData, loading: loadingShipRegions, error: errorShipRegions } = useQuery({ query: GET_STATE_REGIONS, variables: { state: formik.values.ship_state }, jwt: '' })
    const { data: shipPostalData, loading: loadingShipPostals, error: errorShipPostals } = useQuery({ query: GET_REGION_POSTALS, variables: { region: formik.values.ship_city }, jwt: '' })

    const states = stateData as IStates
    const regions = regionData as IRegions
    const postals = postalData as IRegionPostals
    const shipStates = shipStateData as IStates
    const shipRegions = shipRegionData as IRegions
    const shipPostals = shipPostalData as IRegionPostals

    return (
        <section>
            <form onSubmit={formik.handleSubmit} className='space-y-8 w-full' >
                <div className='grid space-y-2 p-4 rounded-lg shadow-md bg-slate-50'>
                    <h2 className='uppercase font-semibold text-siteColors-blue'>Βασικά στοιχεία</h2>
                    <ul className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <li className='grid space-y-1'>
                            <label className='labelForInputForms' htmlFor='username'>username</label>
                            <input
                                disabled
                                className='inputForms bg-gray-100'
                                type="text"
                                id='username'
                                name='username'
                                placeholder='username'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.username} />
                        </li>
                        <li className='grid space-y-1'>
                            <label className='labelForInputForms' htmlFor='email'>Email</label>
                            <input
                                disabled
                                className='inputForms bg-gray-100'
                                type="email"
                                id='email'
                                name='email'
                                placeholder='Email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email} />
                            {formik.errors.email && <div id="feedback">{formik.errors.email}</div>}
                        </li>
                    </ul>
                </div>
                <div className=" p-4 bg-slate-50 rounded-lg shadow-md">
                    <h3 className='font-medium mt-8 mb-4 border-b text-left text-siteColors-purple'>Τύπος παραστατικού</h3>
                    <div className="flex gap-2 items-center">
                        <input type="radio" id="receipt" name="isInvoice" onChange={formik.handleChange}
                            className="w-4 h-4 border-2 border-blue-500 rounded-full" value="false"
                            checked={formik.values.isInvoice === 'false'} />
                        <label htmlFor="receipt" className="text-sm tracking-wide">Απόδειξη</label>
                    </div>
                    <div className="flex gap-2 items-center">
                        <input type="radio" id="invoice" name="isInvoice" onChange={formik.handleChange}
                            className="w-4 h-4 border-2 border-blue-500 rounded-full" value="true"
                            checked={formik.values.isInvoice === 'true'} />
                        <label htmlFor="invoice" className="text-sm tracking-wide">Τιμολόγιο</label>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <ul className=" p-4 bg-slate-50 rounded-lg shadow-md">
                        <li>
                            <h3 className='font-medium mt-8 mb-6 border-b text-siteColors-purple'>Διεύθυνση Χρέωσης</h3>
                            <ul className="space-y-4  p-4">
                                {formik.values.isInvoice === "true" ?
                                    <>
                                        <li>
                                            <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                                <CustomInput
                                                    aria_label="Φόρμα εισαγωγής Όνοματος Εταιρίας"
                                                    type="text"
                                                    id='companyName'
                                                    name='companyName'
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.companyName}
                                                    label='Όνομα Εταιρίας*' />
                                            </div>
                                            {formik.errors.companyName && formik.touched.companyName &&
                                                <small id="feedback" className="text-sm text-red-500">{formik.errors.companyName}</small>}
                                        </li>
                                        <li>
                                            <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                                <CustomInput
                                                    aria_label="Φόρμα εισαγωγής Δραστηριότητας Εταιρίας"
                                                    type="text"
                                                    id='businessActivity'
                                                    name='businessActivity'
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.businessActivity}
                                                    label='Δραστηριότητα*' />
                                            </div>
                                            {formik.errors.businessActivity && formik.touched.businessActivity &&
                                                <small id="feedback" className="text-sm text-red-500">{formik.errors.businessActivity}</small>}
                                        </li>
                                        <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                                    <CustomInput
                                                        aria_label="Φόρμα εισαγωγής Α.Φ.Μ."
                                                        type="text"
                                                        id='afm'
                                                        name='afm'
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.afm}
                                                        label='Α.Φ.Μ.*' />
                                                </div>
                                                {formik.errors.afm && formik.touched.afm &&
                                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.afm}</small>}
                                            </div>
                                            <div>
                                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                                    <CustomInput
                                                        aria_label="Φόρμα εισαγωγής Δ.Ο.Υ."
                                                        type="text"
                                                        id='doy'
                                                        name='doy'
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.doy}
                                                        label='Δ.Ο.Υ.*' />
                                                </div>
                                                {formik.errors.doy && formik.touched.doy &&
                                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.doy}</small>}

                                            </div>
                                        </li>
                                    </> :
                                    <>
                                        <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                                    <CustomInput
                                                        aria_label="Φόρμα εισαγωγής ονόματος"
                                                        type="text"
                                                        id='firstname'
                                                        name='firstname'
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.firstname}
                                                        label='Όνομα*' />
                                                </div>
                                                {formik.errors.firstname && formik.touched.firstname &&
                                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.firstname}</small>}
                                            </div>
                                            <div>
                                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                                    <CustomInput
                                                        aria_label="Φόρμα εισαγωγής επιθέτου"
                                                        type="text"
                                                        id='lastname'
                                                        name='lastname'
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.lastname}
                                                        label='Επίθετο*' />
                                                </div>
                                                {formik.errors.lastname && formik.touched.lastname &&
                                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.lastname}</small>}

                                            </div>
                                        </li>
                                    </>
                                }
                                <li>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής Οδού"
                                                type="text"
                                                id='street'
                                                name='street'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.street}
                                                label='Οδός*' />
                                        </div>
                                        {formik.errors.street && formik.touched.street &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.street}</small>}
                                    </div>
                                </li>
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        {!loading && <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <label htmlFor="country"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Χώρα*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='country'
                                                name='country'
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    formik.setFieldValue('state', "")
                                                    // saveAddresses({ ...addresses, billing: { ...addresses.billing, country: e.target.value, state: '' } })
                                                }}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.country}>
                                                {
                                                    countries.countries.data.map(x => (
                                                        <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>}
                                        {formik.errors.country && formik.touched.country &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.country}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <label htmlFor="state"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Νομός*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='state'
                                                name='state'
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    formik.setFieldValue('city', "")
                                                    // saveAddresses({ ...addresses, billing: { ...addresses.billing, state: e.target.value, city: '' } })
                                                }}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.state}>
                                                <option value="">--Επέλεξε Νομό--</option>
                                                {!loadingState && states.countries.data[0]?.attributes.states.data.map(x => (
                                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>))
                                                }
                                            </select>
                                        </div>
                                        {formik.errors.state && formik.touched.state &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.state}</small>}
                                    </div>
                                </li>
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300  bg-white appearance-none">
                                            <label htmlFor="city"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Πόλη*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='city'
                                                name='city'
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    formik.setFieldValue('zipCode', "")
                                                    // saveAddresses({ ...addresses, billing: { ...addresses.billing, city: e.target.value, zipCode: '' } })
                                                }}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.city}>
                                                <option value="">--Επέλεξε πόλη--</option>
                                                {!loadingRegions && regions.states?.data[0]?.attributes.regions.data.map(x => (
                                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>))
                                                }
                                            </select>
                                        </div>
                                        {formik.errors.city && formik.touched.city &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.city}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <label htmlFor="zipCode"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Τ.Κ*</label>
                                            <input
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.zipCode}
                                                id='zipCode'
                                                name="zipCode"
                                                list="postals-list"
                                                className="block px-2.5 py-2.5 w-full text-sm text-gray-900 bg-transparent focus:outline-none focus:ring-0 peer focus:ring-blue-500 focus:border-blue-500" />
                                            {!loadingPostals && postals !== undefined &&
                                                <datalist id="postals-list">
                                                    {postals?.regions?.data[0]?.attributes.postal_codes.data.map(postal => (
                                                        <option key={postal.id} value={postal.attributes.postal.toString()} />
                                                    ))}
                                                </datalist>}
                                        </div>
                                        {formik.errors.zipCode && formik.touched.zipCode &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.zipCode}</small>}
                                    </div>

                                </li>
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής τηλεφώνου"
                                                type="text"
                                                id='telephone'
                                                name='telephone'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.telephone}
                                                label='Τηλέφωνο'
                                            />
                                        </div>
                                        {formik.errors.telephone && formik.touched.telephone &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.telephone}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής κινητό"
                                                type="text"
                                                id='mobilePhone'
                                                name='mobilePhone'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.mobilePhone}
                                                label='Κινητό*' />
                                        </div>
                                        {formik.errors.mobilePhone && formik.touched.mobilePhone &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.mobilePhone}</small>}

                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <div className='flex my-4'>
                                <input type='checkbox' id='different_shipping' name='different_shipping' checked={formik.values.different_shipping} onChange={formik.handleChange} />
                                <label htmlFor='different_shipping' className="text-sm text-siteColors-purple ml-1">Θέλω να παραλάβω σε άλλη διεύθυνση.</label>
                            </div>
                        </li>
                    </ul>
                    {formik.values.different_shipping &&
                        <div className=" p-4 bg-slate-50 rounded-lg shadow-md">
                            <h3 className='font-medium mt-8 mb-6 border-b text-siteColors-purple'>Διεύθυνση Αποστολής</h3>
                            <ul className="space-y-4 p-4">
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής ονόματος"
                                                type="text"
                                                id='ship_firstname'
                                                name='ship_firstname'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_firstname}
                                                label='Όνομα*' />
                                        </div>
                                        {formik.errors.ship_firstname && formik.touched.ship_firstname &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_firstname}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής επιθέτου"
                                                type="text"
                                                id='ship_lastname'
                                                name='ship_lastname'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_lastname}
                                                label='Επίθετο*' />
                                        </div>
                                        {formik.errors.ship_lastname && formik.touched.ship_lastname &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_lastname}</small>}

                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής Οδού"
                                                type="text"
                                                id='ship_street'
                                                name='ship_street'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_street}
                                                label='Οδός*' />
                                        </div>
                                        {formik.errors.ship_street && formik.touched.ship_street &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_street}</small>}
                                    </div>
                                </li>
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        {!loading && <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <label htmlFor="ship_country"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Χώρα*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='ship_country'
                                                name='ship_country'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_country}>
                                                {
                                                    countries.countries.data.map(x => (
                                                        <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>}
                                        {formik.errors.ship_country && formik.touched.ship_country &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_country}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <label htmlFor="ship_state"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Νομός*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='ship_state'
                                                name='ship_state'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_state}>
                                                <option value="">--Επέλεξε Νομό--</option>
                                                {!loadingShipState && shipStates.countries.data[0]?.attributes.states.data.map(x => (
                                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>))
                                                }
                                            </select>
                                        </div>
                                        {formik.errors.ship_state && formik.touched.ship_state &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_state}</small>}
                                    </div>
                                </li>
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300  bg-white appearance-none">
                                            <label htmlFor="ship_city"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Πόλη*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='ship_city'
                                                name='ship_city'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_city}>
                                                <option value="">--Επέλεξε πόλη--</option>
                                                {!loadingShipRegions && shipRegions.states?.data[0]?.attributes.regions.data.map(x => (
                                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>))
                                                }
                                            </select>
                                        </div>
                                        {formik.errors.ship_city && formik.touched.ship_city &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_city}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <label htmlFor="ship_zipCode"
                                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent dark:bg-gray-900 px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Τ.Κ*</label>
                                            <input
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_zipCode}
                                                id='ship_zipCode'
                                                name="ship_zipCode"
                                                list="ship-postals-list"
                                                className="block px-2.5 py-2.5 w-full text-sm text-gray-900 bg-transparent focus:outline-none focus:ring-0 peer focus:ring-blue-500 focus:border-blue-500" />
                                            {!loadingShipPostals && shipPostals !== undefined &&
                                                <datalist id="ship-postals-list">
                                                    {shipPostals?.regions?.data[0]?.attributes.postal_codes.data.map(postal => (
                                                        <option key={postal.id} value={postal.attributes.postal.toString()} />
                                                    ))}
                                                </datalist>}
                                        </div>
                                        {formik.errors.ship_zipCode && formik.touched.ship_zipCode &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_zipCode}</small>}
                                    </div>

                                </li>
                                <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής τηλεφώνου"
                                                type="text"
                                                id='ship_telephone'
                                                name='ship_telephone'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_telephone}
                                                label='Τηλέφωνο'
                                            />
                                        </div>
                                        {formik.errors.ship_telephone && formik.touched.ship_telephone &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_telephone}</small>}
                                    </div>
                                    <div>
                                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                            <CustomInput
                                                aria_label="Φόρμα εισαγωγής κινητό"
                                                type="text"
                                                id='ship_mobilePhone'
                                                name='ship_mobilePhone'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_mobilePhone}
                                                label='Κινητό*' />
                                        </div>
                                        {formik.errors.ship_mobilePhone && formik.touched.ship_mobilePhone &&
                                            <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_mobilePhone}</small>}

                                    </div>
                                </li>
                            </ul>
                        </div>}
                </div>
                <button
                    className='bg-siteColors-blue hover:opacity-90 disabled:bg-gray-400 transition ease-in duration-200 p-2 text-white rounded'
                    type="submit"
                    disabled={formik.isSubmitting}>Αποθήκευση</button>
            </form>
        </section>
    )
}

export default ProfileAddresses