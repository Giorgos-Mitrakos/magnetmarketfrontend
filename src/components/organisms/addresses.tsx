"use client"
import { useFormik } from "formik"
import * as Yup from 'yup'
import Radio from "../atoms/radio"
import CustomInput from "../atoms/input"
import { forwardRef, useImperativeHandle, useCallback } from "react"
import { IProfile } from "@/app/checkout/customer-informations/page"
import { useNoRevalideteQuery, useQuery } from "@/repositories/clientRepository"
import { GET_COUNTRY_LIST, GET_COUNTRY_STATES, GET_REGION_POSTALS, GET_STATE_REGIONS } from "@/lib/queries/addressQuery"
import { useCheckout } from "@/context/checkout"
import { ICountries, ICustomerInfo, IRegionPostals, IRegions, IStates } from "@/lib/interfaces/addresses"

export type FormInputRef = {
    submitForm: () => void;
    isSubmitting: boolean
};

const Addresses = forwardRef<FormInputRef, IProfile>((props, ref) => {
    console.log(props)
    const { checkout, dispatch } = useCheckout()
    const { data: countriesData, loading, error } = useNoRevalideteQuery({ query: GET_COUNTRY_LIST, jwt: '' })

    const countries = countriesData as ICountries

    const initialValues: ICustomerInfo = {
        id: props.user?.info.id || "",
        email: props.user?.info.email || checkout.addresses.billing.email,
        firstname: props.user?.billing_address?.firstname || checkout.addresses.billing.firstname,
        lastname: props.user?.billing_address?.lastname || checkout.addresses.billing.lastname,
        street: props.user?.billing_address?.street || checkout.addresses.billing.street,
        city: props.user?.billing_address?.city || checkout.addresses.billing.city,
        state: props.user?.billing_address?.state || checkout.addresses.billing.state,
        zipCode: props.user?.billing_address?.zipCode || checkout.addresses.billing.zipCode,
        country: props.user?.billing_address?.country || checkout.addresses.billing.country,
        telephone: props.user?.billing_address?.telephone || checkout.addresses.billing.telephone,
        mobilePhone: props.user?.billing_address?.mobilePhone || checkout.addresses.billing.mobilePhone,
        afm: props.user?.billing_address?.afm || checkout.addresses.billing.afm,
        doy: props.user?.billing_address?.doy || checkout.addresses.billing.doy,
        companyName: props.user?.billing_address?.companyName || checkout.addresses.billing.companyName,
        businessActivity: props.user?.billing_address?.businessActivity || checkout.addresses.billing.businessActivity,
        isInvoice: checkout.addresses.billing.isInvoice || false,
        deliveryNotes: checkout.addresses.deliveryNotes,
        different_shipping: checkout.addresses.different_shipping || false,
        ship_firstname: props.user?.shipping_address?.firstname || checkout.addresses.shipping.firstname,
        ship_lastname: props.user?.shipping_address?.lastname || checkout.addresses.shipping.lastname,
        ship_street: props.user?.shipping_address?.street || checkout.addresses.shipping.street,
        ship_city: props.user?.shipping_address?.city || checkout.addresses.shipping.city,
        ship_state: props.user?.shipping_address?.state || checkout.addresses.shipping.state,
        ship_zipCode: props.user?.shipping_address?.zipCode || checkout.addresses.shipping.zipCode,
        ship_country: props.user?.shipping_address?.country || checkout.addresses.shipping.country,
        ship_telephone: props.user?.shipping_address?.telephone || checkout.addresses.shipping.telephone,
        ship_mobilePhone: props.user?.shipping_address?.mobilePhone || checkout.addresses.shipping.mobilePhone,
    }

    const formik = useFormik({
        initialValues,
        validationSchema: Yup.object({
            isInvoice: Yup.boolean(),
            email: Yup.string().email('*Παρακαλώ ελέγξε το email!').required('*Yποχρεωτικό πεδίο!'),
            country: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            street: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            city: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            state: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            zipCode: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            telephone: Yup.string().notRequired()
                .test(
                    'is-ten-digits',
                    'Το τηλέφωνο πρέπει να έχει 10 ψηφία',
                    value => !value || /^\d{10}$/.test(value)
                ),
            mobilePhone: Yup.string().matches(/^\d{10}$/, 'Το τηλέφωνο πρέπει να έχει 10 ψηφία').required('*Yποχρεωτικό πεδίο!'),
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
            deliveryNotes: Yup.string(),
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
            ship_telephone: Yup.string().notRequired()
                .test(
                    'is-ten-digits',
                    'Το τηλέφωνο πρέπει να έχει 10 ψηφία',
                    value => !value || /^\d{10}$/.test(value)
                ),
            ship_mobilePhone: Yup.string().matches(/^\d{10}$/, 'Το τηλέφωνο πρέπει να έχει 10 ψηφία').when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
        }),
        onSubmit: (values) => {
            const addresses = {
                different_shipping: values.different_shipping,
                deliveryNotes: values.deliveryNotes,
                billing: {
                    isInvoice: values.isInvoice,
                    email: values.email,
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
            dispatch({ type: "SAVE_ADDRESS", payload: addresses })
        }
    });

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formik.submitForm()
        },
        resetForm: () => {
            formik.resetForm();
        },
        isSubmitting: formik.isSubmitting
    }));

    const { data: stateData, loading: loadingState } = useQuery({ query: GET_COUNTRY_STATES, variables: { country: formik.values.country }, jwt: '' })
    const { data: regionData, loading: loadingRegions } = useQuery({ query: GET_STATE_REGIONS, variables: { state: formik.values.state }, jwt: '' })
    const { data: postalData, loading: loadingPostals } = useQuery({ query: GET_REGION_POSTALS, variables: { region: formik.values.city }, jwt: '' })

    const { data: shipStateData, loading: loadingShipState } = useQuery({ query: GET_COUNTRY_STATES, variables: { country: formik.values.ship_country }, jwt: '' })
    const { data: shipRegionData, loading: loadingShipRegions } = useQuery({ query: GET_STATE_REGIONS, variables: { state: formik.values.ship_state }, jwt: '' })
    const { data: shipPostalData, loading: loadingShipPostals } = useQuery({ query: GET_REGION_POSTALS, variables: { region: formik.values.ship_city }, jwt: '' })

    const states = stateData as IStates
    const regions = regionData as IRegions
    const postals = postalData as IRegionPostals
    const shipStates = shipStateData as IStates
    const shipRegions = shipRegionData as IRegions
    const shipPostals = shipPostalData as IRegionPostals

    // FIXED: Remove dispatch calls from onChange handlers to prevent focus loss
    const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>, isShipping: boolean = false) => {
        formik.handleChange(e)
        formik.setFieldValue(isShipping ? 'ship_state' : 'state', "")
    }, [formik])

    const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>, isShipping: boolean = false) => {
        formik.handleChange(e)
        formik.setFieldValue(isShipping ? 'ship_city' : 'city', "")
    }, [formik])

    const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>, isShipping: boolean = false) => {
        formik.handleChange(e)
        formik.setFieldValue(isShipping ? 'ship_zipCode' : 'zipCode', "")
    }, [formik])

    const onCheckNoteChange = useCallback(() => {
        const isInvoice = !formik.values.isInvoice
        formik.setFieldValue('isInvoice', isInvoice)
    }, [formik.values.isInvoice, formik.setFieldValue])

    const onDifferentAddressChange = useCallback(() => {
        const differentShipping = !formik.values.different_shipping
        formik.setFieldValue('different_shipping', differentShipping)
    }, [formik.values.different_shipping, formik.setFieldValue])

    return (
        <section>
            <form onSubmit={formik.handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-slate-200 pb-2 border-b border-gray-200 dark:border-slate-700'>
                        Στοιχεία επικοινωνίας
                    </h3>
                    <div className="relative">
                        <CustomInput
                            aria_label="Φόρμα εισαγωγής Email"
                            type="email"
                            id='email'
                            name='email'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            label='Email'
                            error={formik.touched.email ? formik.errors.email : undefined}
                        />
                    </div>
                </div>

                {/* Document Type */}
                <div className="space-y-4">
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-slate-200 pb-2 border-b border-gray-200 dark:border-slate-700'>
                        Τύπος παραστατικού
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Radio 
                            name="checkNote" 
                            id="receipt" 
                            value="Απόδειξη"
                            checked={!formik.values.isInvoice} 
                            onChange={onCheckNoteChange}
                        />
                        <Radio 
                            name="checkNote" 
                            id="invoice" 
                            value="Τιμολόγιο"
                            checked={formik.values.isInvoice} 
                            onChange={onCheckNoteChange}
                        />
                    </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-6">
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-slate-200 pb-2 border-b border-gray-200 dark:border-slate-700'>
                        Διεύθυνση
                    </h3>
                    
                    {formik.values.isInvoice ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <CustomInput
                                    aria_label="Φόρμα εισαγωγής Όνοματος Εταιρίας"
                                    type="text"
                                    id='companyName'
                                    name='companyName'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.companyName}
                                    label='Όνομα Εταιρίας*'
                                    error={formik.touched.companyName ? formik.errors.companyName : undefined}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <CustomInput
                                    aria_label="Φόρμα εισαγωγής Δραστηριότητας Εταιρίας"
                                    type="text"
                                    id='businessActivity'
                                    name='businessActivity'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.businessActivity}
                                    label='Δραστηριότητα*'
                                    error={formik.touched.businessActivity ? formik.errors.businessActivity : undefined}
                                />
                            </div>
                            <div>
                                <CustomInput
                                    aria_label="Φόρμα εισαγωγής Α.Φ.Μ."
                                    type="text"
                                    id='afm'
                                    name='afm'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.afm}
                                    label='Α.Φ.Μ.*'
                                    error={formik.touched.afm ? formik.errors.afm : undefined}
                                />
                            </div>
                            <div>
                                <CustomInput
                                    aria_label="Φόρμα εισαγωγής Δ.Ο.Υ."
                                    type="text"
                                    id='doy'
                                    name='doy'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.doy}
                                    label='Δ.Ο.Υ.*'
                                    error={formik.touched.doy ? formik.errors.doy : undefined}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <CustomInput
                                    aria_label="Φόρμα εισαγωγής ονόματος"
                                    type="text"
                                    id='firstname'
                                    name='firstname'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.firstname}
                                    label='Όνομα*'
                                    error={formik.touched.firstname ? formik.errors.firstname : undefined}
                                />
                            </div>
                            <div>
                                <CustomInput
                                    aria_label="Φόρμα εισαγωγής επιθέτου"
                                    type="text"
                                    id='lastname'
                                    name='lastname'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.lastname}
                                    label='Επίθετο*'
                                    error={formik.touched.lastname ? formik.errors.lastname : undefined}
                                />
                            </div>
                        </div>
                    )}

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής Οδού"
                                type="text"
                                id='street'
                                name='street'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.street}
                                label='Οδός*'
                                error={formik.touched.street ? formik.errors.street : undefined}
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Χώρα*
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                id='country'
                                name='country'
                                onChange={(e) => handleCountryChange(e, false)}
                                onBlur={formik.handleBlur}
                                value={formik.values.country}>
                                <option value="">--Επέλεξε Χώρα--</option>
                                {countries?.countries?.data.map(x => (
                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                ))}
                            </select>
                            {formik.errors.country && formik.touched.country && (
                                <small className="text-sm text-red-500 mt-1 block">{formik.errors.country}</small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Νομός*
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                id='state'
                                name='state'
                                onChange={(e) => handleStateChange(e, false)}
                                onBlur={formik.handleBlur}
                                value={formik.values.state}>
                                <option value="">--Επέλεξε Νομό--</option>
                                {!loadingState && states?.countries?.data[0]?.attributes.states.data.map(x => (
                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                ))}
                            </select>
                            {formik.errors.state && formik.touched.state && (
                                <small className="text-sm text-red-500 mt-1 block">{formik.errors.state}</small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Πόλη*
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                id='city'
                                name='city'
                                onChange={(e) => handleCityChange(e, false)}
                                onBlur={formik.handleBlur}
                                value={formik.values.city}>
                                <option value="">--Επέλεξε πόλη--</option>
                                {!loadingRegions && regions?.states?.data[0]?.attributes.regions.data.map(x => (
                                    <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                ))}
                            </select>
                            {formik.errors.city && formik.touched.city && (
                                <small className="text-sm text-red-500 mt-1 block">{formik.errors.city}</small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Τ.Κ*
                            </label>
                            <input
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.zipCode}
                                id='zipCode'
                                name="zipCode"
                                list="postals-list"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                placeholder="Εισάγετε Τ.Κ."
                            />
                            {!loadingPostals && postals !== undefined && (
                                <datalist id="postals-list">
                                    {postals?.regions?.data[0]?.attributes.postal_codes.data.map(postal => (
                                        <option key={postal.id} value={postal.attributes.postal.toString()} />
                                    ))}
                                </datalist>
                            )}
                            {formik.errors.zipCode && formik.touched.zipCode && (
                                <small className="text-sm text-red-500 mt-1 block">{formik.errors.zipCode}</small>
                            )}
                        </div>

                        <div>
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής τηλεφώνου"
                                type="text"
                                id='telephone'
                                name='telephone'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.telephone}
                                label='Τηλέφωνο'
                                error={formik.touched.telephone ? formik.errors.telephone : undefined}
                            />
                        </div>

                        <div>
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής κινητό"
                                type="text"
                                id='mobilePhone'
                                name='mobilePhone'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.mobilePhone}
                                label='Κινητό*'
                                error={formik.touched.mobilePhone ? formik.errors.mobilePhone : undefined}
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery Notes */}
                <div className="space-y-4">
                    <label htmlFor="deliveryNotes" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Σχόλια
                    </label>
                    <textarea
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                        id="deliveryNotes"
                        name="deliveryNotes"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.deliveryNotes}
                        rows={4}
                        maxLength={200}
                        placeholder="Προσθέστε σχόλια για την παράδοση..."
                    />
                </div>

                {/* Different Shipping Address */}
                <div className="space-y-4">
                    <div className='flex items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg'>
                        <input 
                            type='checkbox' 
                            id='different_shipping' 
                            name='different_shipping' 
                            checked={formik.values.different_shipping} 
                            onChange={onDifferentAddressChange}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor='different_shipping' className="ml-3 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                            Θέλω να παραλάβω σε άλλη διεύθυνση
                        </label>
                    </div>

                    {formik.values.different_shipping && (
                        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-slate-200'>
                                Διεύθυνση Αποστολής
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής ονόματος"
                                        type="text"
                                        id='ship_firstname'
                                        name='ship_firstname'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_firstname}
                                        label='Όνομα*'
                                        error={formik.touched.ship_firstname ? formik.errors.ship_firstname : undefined}
                                    />
                                </div>
                                <div>
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής επιθέτου"
                                        type="text"
                                        id='ship_lastname'
                                        name='ship_lastname'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_lastname}
                                        label='Επίθετο*'
                                        error={formik.touched.ship_lastname ? formik.errors.ship_lastname : undefined}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής Οδού"
                                        type="text"
                                        id='ship_street'
                                        name='ship_street'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_street}
                                        label='Οδός*'
                                        error={formik.touched.ship_street ? formik.errors.ship_street : undefined}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="ship_country" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Χώρα*
                                    </label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                        id='ship_country'
                                        name='ship_country'
                                        onChange={(e) => handleCountryChange(e, true)}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_country}>
                                        <option value="">--Επέλεξε Χώρα--</option>
                                        {countries?.countries?.data.map(x => (
                                            <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                        ))}
                                    </select>
                                    {formik.errors.ship_country && formik.touched.ship_country && (
                                        <small className="text-sm text-red-500 mt-1 block">{formik.errors.ship_country}</small>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="ship_state" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Νομός*
                                    </label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                        id='ship_state'
                                        name='ship_state'
                                        onChange={(e) => handleStateChange(e, true)}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_state}>
                                        <option value="">--Επέλεξε Νομό--</option>
                                        {!loadingShipState && shipStates?.countries?.data[0]?.attributes.states.data.map(x => (
                                            <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                        ))}
                                    </select>
                                    {formik.errors.ship_state && formik.touched.ship_state && (
                                        <small className="text-sm text-red-500 mt-1 block">{formik.errors.ship_state}</small>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="ship_city" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Πόλη*
                                    </label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                        id='ship_city'
                                        name='ship_city'
                                        onChange={(e) => handleCityChange(e, true)}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_city}>
                                        <option value="">--Επέλεξε πόλη--</option>
                                        {!loadingShipRegions && shipRegions?.states?.data[0]?.attributes.regions.data.map(x => (
                                            <option key={x.id} value={x.attributes.name}>{x.attributes.name}</option>
                                        ))}
                                    </select>
                                    {formik.errors.ship_city && formik.touched.ship_city && (
                                        <small className="text-sm text-red-500 mt-1 block">{formik.errors.ship_city}</small>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="ship_zipCode" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Τ.Κ*
                                    </label>
                                    <input
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_zipCode}
                                        id='ship_zipCode'
                                        name="ship_zipCode"
                                        list="ship-postals-list"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                        placeholder="Εισάγετε Τ.Κ."
                                    />
                                    {!loadingShipPostals && shipPostals !== undefined && (
                                        <datalist id="ship-postals-list">
                                            {shipPostals?.regions?.data[0]?.attributes.postal_codes.data.map(postal => (
                                                <option key={postal.id} value={postal.attributes.postal.toString()} />
                                            ))}
                                        </datalist>
                                    )}
                                    {formik.errors.ship_zipCode && formik.touched.ship_zipCode && (
                                        <small className="text-sm text-red-500 mt-1 block">{formik.errors.ship_zipCode}</small>
                                    )}
                                </div>

                                <div>
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής τηλεφώνου"
                                        type="text"
                                        id='ship_telephone'
                                        name='ship_telephone'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_telephone}
                                        label='Τηλέφωνο'
                                        error={formik.touched.ship_telephone ? formik.errors.ship_telephone : undefined}
                                    />
                                </div>

                                <div>
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής κινητό"
                                        type="text"
                                        id='ship_mobilePhone'
                                        name='ship_mobilePhone'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_mobilePhone}
                                        label='Κινητό*'
                                        error={formik.touched.ship_mobilePhone ? formik.errors.ship_mobilePhone : undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </section>
    )
})

Addresses.displayName = 'Addresses'

export default Addresses