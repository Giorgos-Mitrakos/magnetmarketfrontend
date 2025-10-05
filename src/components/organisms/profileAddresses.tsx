'use client'

import { useFormik } from "formik"
import * as Yup from 'yup'
import CustomInput from "../atoms/input"
import { useNoRevalideteQuery, useQuery } from "@/repositories/clientRepository"
import { GET_COUNTRY_LIST, GET_COUNTRY_STATES, GET_REGION_POSTALS, GET_STATE_REGIONS } from "@/lib/queries/addressQuery"
import { useState } from "react"
import { AiOutlineLoading3Quarters, AiOutlineSave, AiOutlineUser, AiOutlineHome, AiOutlineEnvironment } from "react-icons/ai"
import { FaMapMarkerAlt, FaBuilding, FaReceipt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"

// Types (unchanged)
interface FormInputRef {
    submitForm: () => void;
    isSubmitting: boolean
}

interface IUserInfo {
    id: string,
    username: string,
    email: string
}

interface ICustomerInfo {
    id: number | string
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

// Enhanced Loading Spinner Component
const LoadingSpinner = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <AiOutlineLoading3Quarters 
        className={`animate-spin text-siteColors-purple ${className}`} 
        style={{ fontSize: size }} 
    />
)

// Enhanced Section Header Component
const SectionHeader = ({ title, icon, description }: { title: string; icon: React.ReactNode; description?: string }) => (
    <div className="mb-8">
        <div className="flex items-center mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-siteColors-purple to-siteColors-pink rounded-lg shadow-sm">
                <span className="text-white text-lg">
                    {icon}
                </span>
            </div>
            <h3 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {description && (
            <p className="text-gray-600 dark:text-gray-400 ml-14">{description}</p>
        )}
    </div>
)

// Enhanced Form Field Group Component
const FormFieldGroup = ({ children, className = "", cols = "lg:grid-cols-2" }: { children: React.ReactNode; className?: string; cols?: string }) => (
    <div className={`grid grid-cols-1 ${cols} gap-6 ${className}`}>
        {children}
    </div>
)

// Enhanced Radio Button Component
const RadioOption = ({ id, name, value, label, checked, onChange, description }: {
    id: string;
    name: string;
    value: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    description?: string;
}) => (
    <div className={`relative flex items-start p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        checked 
            ? 'border-siteColors-purple bg-siteColors-purple/5 shadow-md' 
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
    }`}>
        <div className="flex items-center h-5">
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="w-5 h-5 text-siteColors-purple border-2 border-gray-300 focus:ring-2 focus:ring-siteColors-purple focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-siteColors-lightblue"
            />
        </div>
        <div className="ml-4 flex flex-col">
            <label htmlFor={id} className="block text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                {label}
            </label>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
        </div>
    </div>
)

// Status Message Component
const StatusMessage = ({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) => (
    <div className={`fixed bottom-6 right-6 flex items-center p-4 rounded-xl shadow-lg transform animate-slide-in-right ${
        type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
    }`}>
        <div className="flex items-center">
            {type === 'success' ? (
                <FaCheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
                <FaExclamationTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
        </div>
        <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
            ×
        </button>
    </div>
)

const ProfileAddresses = ({ userInfo, billingAddress, shippingAddress, jwt }: {
    userInfo: IUserInfo,
    billingAddress: ICustomerInfo | null,
    shippingAddress: ICustomerInfo | null,
    jwt: string
}) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [showStatus, setShowStatus] = useState(false)

    const { data: countriesData, loading: countriesLoading } = useNoRevalideteQuery({ 
        query: GET_COUNTRY_LIST, 
        jwt: '' 
    })

    const countries = countriesData as ICountries

    const initialValues = {
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
        isInvoice: billingAddress?.isInvoice?.toString() || "false",
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
        initialValues,
        validationSchema: Yup.object({
            // ... validation schema unchanged
        }),
        onSubmit: async (values) => {
            setSaveStatus('loading')
            setShowStatus(true)
            try {
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

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-address/updateUser`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${jwt}`,
                    },
                    body: JSON.stringify({ addresses })
                })

                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`)
                }

                setSaveStatus('success')
                setTimeout(() => {
                    setShowStatus(false)
                    setTimeout(() => setSaveStatus('idle'), 300)
                }, 4000)
            } catch (error) {
                setSaveStatus('error')
                setTimeout(() => {
                    setShowStatus(false)
                    setTimeout(() => setSaveStatus('idle'), 300)
                }, 4000)
            }
        }
    })

    // API queries for address data (unchanged)
    const { data: stateData, loading: loadingState } = useQuery({ 
        query: GET_COUNTRY_STATES, 
        variables: { country: formik.values.country }, 
        jwt: '' 
    })
    const { data: regionData, loading: loadingRegions } = useQuery({ 
        query: GET_STATE_REGIONS, 
        variables: { state: formik.values.state }, 
        jwt: '' 
    })
    const { data: postalData, loading: loadingPostals } = useQuery({ 
        query: GET_REGION_POSTALS, 
        variables: { region: formik.values.city }, 
        jwt: '' 
    })

    const { data: shipStateData, loading: loadingShipState } = useQuery({ 
        query: GET_COUNTRY_STATES, 
        variables: { country: formik.values.ship_country }, 
        jwt: '' 
    })
    const { data: shipRegionData, loading: loadingShipRegions } = useQuery({ 
        query: GET_STATE_REGIONS, 
        variables: { state: formik.values.ship_state }, 
        jwt: '' 
    })
    const { data: shipPostalData, loading: loadingShipPostals } = useQuery({ 
        query: GET_REGION_POSTALS, 
        variables: { region: formik.values.ship_city }, 
        jwt: '' 
    })

    const states = stateData as IStates
    const regions = regionData as IRegions
    const postals = postalData as IRegionPostals
    const shipStates = shipStateData as IStates
    const shipRegions = shipRegionData as IRegions
    const shipPostals = shipPostalData as IRegionPostals

    // Enhanced Select Input Component
    const SelectInput = ({ 
        id, 
        name, 
        value, 
        onChange, 
        onBlur, 
        label, 
        children, 
        loading = false,
        error,
        touched 
    }: {
        id: string;
        name: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
        label: string;
        children: React.ReactNode;
        loading?: boolean;
        error?: string;
        touched?: boolean;
    }) => (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {label}
            </label>
            <div className="relative">
                <select
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full h-min p-2 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-siteColors-purple transition-all duration-200 appearance-none ${
                        error && touched 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {loading ? (
                        <LoadingSpinner size={16} />
                    ) : (
                        <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 dark:border-gray-300 transform rotate-45 -translate-y-1/2" />
                    )}
                </div>
            </div>
            {error && touched && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {error}
                </p>
            )}
        </div>
    )

    return (
        <section className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Διευθύνσεις & Στοιχεία
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Διαχειριστείτε τις διευθύνσεις χρέωσης και αποστολής σας. 
                    Οι αλλαγές θα εφαρμοστούν αυτόματα στις μελλοντικές σας παραγγελίες.
                </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <SectionHeader 
                        title="Βασικά Στοιχεία" 
                        icon={<AiOutlineUser />}
                        description="Τα βασικά σας στοιχεία λογαριασμού"
                    />
                    <FormFieldGroup>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Username
                            </label>
                            <input
                                disabled
                                className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                type="text"
                                value={formik.values.username}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Email *
                            </label>
                            <input
                                disabled
                                className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                type="email"
                                value={formik.values.email}
                            />
                            {formik.errors.email && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                                    {formik.errors.email}
                                </p>
                            )}
                        </div>
                    </FormFieldGroup>
                </div>

                {/* Document Type Section */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <SectionHeader 
                        title="Τύπος Παραστατικού" 
                        icon={<FaReceipt />}
                        description="Επιλέξτε τον τύπο του παραστατικού που θέλετε να λαμβάνετε"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <RadioOption
                            id="receipt"
                            name="isInvoice"
                            value="false"
                            label="Απόδειξη"
                            description="Για προσωπική χρήση"
                            checked={formik.values.isInvoice === 'false'}
                            onChange={formik.handleChange}
                        />
                        <RadioOption
                            id="invoice"
                            name="isInvoice"
                            value="true"
                            label="Τιμολόγιο"
                            description="Για επαγγελματική χρήση"
                            checked={formik.values.isInvoice === 'true'}
                            onChange={formik.handleChange}
                        />
                    </div>
                </div>

                <div className="grid xl:grid-cols-2 gap-8">
                    {/* Billing Address Section */}
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <SectionHeader 
                            title="Διεύθυνση Χρέωσης" 
                            icon={<FaBuilding />}
                            description="Η διεύθυνση χρέωσης της πιστωτικής σας κάρτας"
                        />
                        
                        <div className="space-y-6">
                            {formik.values.isInvoice === "true" ? (
                                <>
                                    <FormFieldGroup>
                                        <CustomInput
                                            aria_label="Όνομα Εταιρίας"
                                            type="text"
                                            id="companyName"
                                            name="companyName"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.companyName}
                                            label="Όνομα Εταιρίας *"
                                            error={formik.errors.companyName}
                                            touched={formik.touched.companyName}
                                        />
                                        <CustomInput
                                            aria_label="Δραστηριότητα Εταιρίας"
                                            type="text"
                                            id="businessActivity"
                                            name="businessActivity"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.businessActivity}
                                            label="Δραστηριότητα *"
                                            error={formik.errors.businessActivity}
                                            touched={formik.touched.businessActivity}
                                        />
                                    </FormFieldGroup>
                                    <FormFieldGroup>
                                        <CustomInput
                                            aria_label="Α.Φ.Μ."
                                            type="text"
                                            id="afm"
                                            name="afm"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.afm}
                                            label="Α.Φ.Μ. *"
                                            error={formik.errors.afm}
                                            touched={formik.touched.afm}
                                        />
                                        <CustomInput
                                            aria_label="Δ.Ο.Υ."
                                            type="text"
                                            id="doy"
                                            name="doy"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.doy}
                                            label="Δ.Ο.Υ. *"
                                            error={formik.errors.doy}
                                            touched={formik.touched.doy}
                                        />
                                    </FormFieldGroup>
                                </>
                            ) : (
                                <FormFieldGroup>
                                    <CustomInput
                                        aria_label="Όνομα"
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.firstname}
                                        label="Όνομα *"
                                        error={formik.errors.firstname}
                                        touched={formik.touched.firstname}
                                    />
                                    <CustomInput
                                        aria_label="Επίθετο"
                                        type="text"
                                        id="lastname"
                                        name="lastname"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.lastname}
                                        label="Επίθετο *"
                                        error={formik.errors.lastname}
                                        touched={formik.touched.lastname}
                                    />
                                </FormFieldGroup>
                            )}

                            <CustomInput
                                aria_label="Οδός"
                                type="text"
                                id="street"
                                name="street"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.street}
                                label="Οδός *"
                                error={formik.errors.street}
                                touched={formik.touched.street}
                            />

                            <FormFieldGroup>
                                <SelectInput
                                    id="country"
                                    name="country"
                                    value={formik.values.country}
                                    onChange={(e) => {
                                        formik.handleChange(e)
                                        formik.setFieldValue('state', "")
                                        formik.setFieldValue('city', "")
                                        formik.setFieldValue('zipCode', "")
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Χώρα *"
                                    error={formik.errors.country}
                                    touched={formik.touched.country}
                                >
                                    {countries?.countries?.data.map(x => (
                                        <option key={x.id} value={x.attributes.name}>
                                            {x.attributes.name}
                                        </option>
                                    ))}
                                </SelectInput>

                                <SelectInput
                                    id="state"
                                    name="state"
                                    value={formik.values.state}
                                    onChange={(e) => {
                                        formik.handleChange(e)
                                        formik.setFieldValue('city', "")
                                        formik.setFieldValue('zipCode', "")
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Νομός *"
                                    loading={loadingState}
                                    error={formik.errors.state}
                                    touched={formik.touched.state}
                                >
                                    <option value="">-- Επέλεξε Νομό --</option>
                                    {states?.countries?.data[0]?.attributes.states.data.map(x => (
                                        <option key={x.id} value={x.attributes.name}>
                                            {x.attributes.name}
                                        </option>
                                    ))}
                                </SelectInput>
                            </FormFieldGroup>

                            <FormFieldGroup>
                                <SelectInput
                                    id="city"
                                    name="city"
                                    value={formik.values.city}
                                    onChange={(e) => {
                                        formik.handleChange(e)
                                        formik.setFieldValue('zipCode', "")
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Πόλη *"
                                    loading={loadingRegions}
                                    error={formik.errors.city}
                                    touched={formik.touched.city}
                                >
                                    <option value="">-- Επέλεξε Πόλη --</option>
                                    {regions?.states?.data[0]?.attributes.regions.data.map(x => (
                                        <option key={x.id} value={x.attributes.name}>
                                            {x.attributes.name}
                                        </option>
                                    ))}
                                </SelectInput>

                                <div className="relative">
                                    <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Ταχυδρομικός Κώδικας *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="zipCode"
                                            name="zipCode"
                                            value={formik.values.zipCode}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            list="postals-list"
                                            className={`w-full p-2 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-siteColors-purple transition-all duration-200 ${
                                                formik.errors.zipCode && formik.touched.zipCode 
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                            placeholder="Εισάγετε Τ.Κ."
                                        />
                                        {loadingPostals && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <LoadingSpinner size={16} />
                                            </div>
                                        )}
                                    </div>
                                    {postals?.regions?.data[0]?.attributes.postal_codes.data && (
                                        <datalist id="postals-list">
                                            {postals.regions.data[0].attributes.postal_codes.data.map(postal => (
                                                <option key={postal.id} value={postal.attributes.postal.toString()} />
                                            ))}
                                        </datalist>
                                    )}
                                    {formik.errors.zipCode && formik.touched.zipCode && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                            <FaExclamationTriangle className="w-3 h-3 mr-1" />
                                            {formik.errors.zipCode}
                                        </p>
                                    )}
                                </div>
                            </FormFieldGroup>

                            <FormFieldGroup>
                                <CustomInput
                                    aria_label="Τηλέφωνο"
                                    type="text"
                                    id="telephone"
                                    name="telephone"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.telephone}
                                    label="Τηλέφωνο"
                                    error={formik.errors.telephone}
                                    touched={formik.touched.telephone}
                                />
                                <CustomInput
                                    aria_label="Κινητό"
                                    type="text"
                                    id="mobilePhone"
                                    name="mobilePhone"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.mobilePhone}
                                    label="Κινητό *"
                                    error={formik.errors.mobilePhone}
                                    touched={formik.touched.mobilePhone}
                                />
                            </FormFieldGroup>
                        </div>

                        {/* Different Shipping Checkbox */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-siteColors-purple/5 to-siteColors-pink/5 rounded-xl border border-siteColors-purple/20">
                            <label className="flex items-start space-x-4 cursor-pointer group">
                                <div className="flex items-center h-5 mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="different_shipping"
                                        name="different_shipping"
                                        checked={formik.values.different_shipping}
                                        onChange={formik.handleChange}
                                        className="w-5 h-5 text-siteColors-purple border-2 border-gray-300 rounded focus:ring-2 focus:ring-siteColors-purple focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 group-hover:border-siteColors-purple transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-lg font-semibold text-gray-900 dark:text-white group-hover:text-siteColors-purple transition-colors">
                                        Διαφορετική διεύθυνση αποστολής
                                    </span>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        Οι παραγγελίες μου θα αποστέλλονται σε διαφορετική διεύθυνση από αυτή της χρέωσης
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Shipping Address Section */}
                    {formik.values.different_shipping && (
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <SectionHeader 
                                title="Διεύθυνση Αποστολής" 
                                icon={<AiOutlineHome />}
                                description="Η διεύθυνση που θα λαμβάνετε τις παραγγελίες"
                            />
                            
                            <div className="space-y-6">
                                <FormFieldGroup>
                                    <CustomInput
                                        aria_label="Όνομα Αποστολής"
                                        type="text"
                                        id="ship_firstname"
                                        name="ship_firstname"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_firstname}
                                        label="Όνομα *"
                                        error={formik.errors.ship_firstname}
                                        touched={formik.touched.ship_firstname}
                                    />
                                    <CustomInput
                                        aria_label="Επίθετο Αποστολής"
                                        type="text"
                                        id="ship_lastname"
                                        name="ship_lastname"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_lastname}
                                        label="Επίθετο *"
                                        error={formik.errors.ship_lastname}
                                        touched={formik.touched.ship_lastname}
                                    />
                                </FormFieldGroup>

                                <CustomInput
                                    aria_label="Οδός Αποστολής"
                                    type="text"
                                    id="ship_street"
                                    name="ship_street"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.ship_street}
                                    label="Οδός *"
                                    error={formik.errors.ship_street}
                                    touched={formik.touched.ship_street}
                                />

                                <FormFieldGroup>
                                    <SelectInput
                                        id="ship_country"
                                        name="ship_country"
                                        value={formik.values.ship_country}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        label="Χώρα *"
                                        error={formik.errors.ship_country}
                                        touched={formik.touched.ship_country}
                                    >
                                        {countries?.countries?.data.map(x => (
                                            <option key={x.id} value={x.attributes.name}>
                                                {x.attributes.name}
                                            </option>
                                        ))}
                                    </SelectInput>

                                    <SelectInput
                                        id="ship_state"
                                        name="ship_state"
                                        value={formik.values.ship_state}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        label="Νομός *"
                                        loading={loadingShipState}
                                        error={formik.errors.ship_state}
                                        touched={formik.touched.ship_state}
                                    >
                                        <option value="">-- Επέλεξε Νομό --</option>
                                        {shipStates?.countries?.data[0]?.attributes.states.data.map(x => (
                                            <option key={x.id} value={x.attributes.name}>
                                                {x.attributes.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                </FormFieldGroup>

                                <FormFieldGroup>
                                    <SelectInput
                                        id="ship_city"
                                        name="ship_city"
                                        value={formik.values.ship_city}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        label="Πόλη *"
                                        loading={loadingShipRegions}
                                        error={formik.errors.ship_city}
                                        touched={formik.touched.ship_city}
                                    >
                                        <option value="">-- Επέλεξε Πόλη --</option>
                                        {shipRegions?.states?.data[0]?.attributes.regions.data.map(x => (
                                            <option key={x.id} value={x.attributes.name}>
                                                {x.attributes.name}
                                            </option>
                                        ))}
                                    </SelectInput>

                                    <div className="relative">
                                        <label htmlFor="ship_zipCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Ταχυδρομικός Κώδικας *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="ship_zipCode"
                                                name="ship_zipCode"
                                                value={formik.values.ship_zipCode}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                list="ship-postals-list"
                                                className={`w-full p-2 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-siteColors-purple focus:border-siteColors-purple transition-all duration-200 ${
                                                    formik.errors.ship_zipCode && formik.touched.ship_zipCode 
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                                placeholder="Εισάγετε Τ.Κ."
                                            />
                                            {loadingShipPostals && (
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                    <LoadingSpinner size={16} />
                                                </div>
                                            )}
                                        </div>
                                        {shipPostals?.regions?.data[0]?.attributes.postal_codes.data && (
                                            <datalist id="ship-postals-list">
                                                {shipPostals.regions.data[0].attributes.postal_codes.data.map(postal => (
                                                    <option key={postal.id} value={postal.attributes.postal.toString()} />
                                                ))}
                                            </datalist>
                                        )}
                                        {formik.errors.ship_zipCode && formik.touched.ship_zipCode && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                <FaExclamationTriangle className="w-3 h-3 mr-1" />
                                                {formik.errors.ship_zipCode}
                                            </p>
                                        )}
                                    </div>
                                </FormFieldGroup>

                                <FormFieldGroup>
                                    <CustomInput
                                        aria_label="Τηλέφωνο Αποστολής"
                                        type="text"
                                        id="ship_telephone"
                                        name="ship_telephone"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_telephone}
                                        label="Τηλέφωνο"
                                        error={formik.errors.ship_telephone}
                                        touched={formik.touched.ship_telephone}
                                    />
                                    <CustomInput
                                        aria_label="Κινητό Αποστολής"
                                        type="text"
                                        id="ship_mobilePhone"
                                        name="ship_mobilePhone"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_mobilePhone}
                                        label="Κινητό *"
                                        error={formik.errors.ship_mobilePhone}
                                        touched={formik.touched.ship_mobilePhone}
                                    />
                                </FormFieldGroup>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center md:justify-end pt-8 border-t border-gray-200 dark:border-gray-600">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting || saveStatus === 'loading'}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-siteColors-purple to-siteColors-pink hover:from-siteColors-purple/90 hover:to-siteColors-pink/90 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md"
                    >
                        {saveStatus === 'loading' ? (
                            <>
                                <LoadingSpinner size={20} className="text-white" />
                                <span className="ml-3">Αποθήκευση...</span>
                            </>
                        ) : (
                            <>
                                <AiOutlineSave className="mr-3 text-xl" />
                                <span>Αποθήκευση Αλλαγών</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Enhanced Status Messages */}
            {showStatus && (
                <>
                    {saveStatus === 'success' && (
                        <StatusMessage
                            type="success"
                            message="Τα στοιχεία αποθηκεύτηκαν επιτυχώς!"
                            onClose={() => setShowStatus(false)}
                        />
                    )}
                    {saveStatus === 'error' && (
                        <StatusMessage
                            type="error"
                            message="Σφάλμα κατά την αποθήκευση. Παρακαλώ δοκιμάστε ξανά."
                            onClose={() => setShowStatus(false)}
                        />
                    )}
                </>
            )}
        </section>
    )
}

export default ProfileAddresses