"use client"
import { useFormik } from "formik"
import * as Yup from 'yup'
import Radio from "../atoms/radio"
import CustomInput from "../atoms/input"
import { forwardRef, useContext, useImperativeHandle } from "react"
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

    const { checkout, dispatch } = useCheckout()
    const { data: countriesData, loading, error } = useNoRevalideteQuery({ query: GET_COUNTRY_LIST, jwt: '' })

    const countries = countriesData as ICountries

    let initialValues: ICustomerInfo = {
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
        isInvoice: checkout.addresses.billing.isInvoice,
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
        initialValues: initialValues,
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
            // .email('*Το email δεν είναι σωστό!!!')
            // .required('*To email είναι υποχρεωτικό πεδίο!'),
            // password: Yup.string().required("*Συμπληρώστε τον κωδικό σας!"),
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
            // saveAddresses(addresses)
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

    const onCheckNoteChange = () => {
        const updateAddresses = { ...checkout.addresses, billing: { ...checkout.addresses.billing, isInvoice: !checkout.addresses.billing.isInvoice } }
        // saveAddresses(updateAddresses)
        dispatch({ type: "SAVE_ADDRESS", payload: updateAddresses })
        formik.values.isInvoice = !checkout.addresses.billing.isInvoice
    }

    const ondifferentAddressChange = () => {
        const updateAddresses = { ...checkout.addresses, different_shipping: !checkout.addresses.different_shipping }
        // saveAddresses(updateAddresses)
        dispatch({ type: "SAVE_ADDRESS", payload: updateAddresses })
        formik.values.different_shipping = !checkout.addresses.different_shipping
    }

    return (
        <section>
            <form onSubmit={formik.handleSubmit}>
                <ul className='space-y-4 w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg' >
                    <li>
                        <h3 className='font-medium mb-6 border-b text-siteColors-purple dark:text-slate-200'>Στοιχεία επικοινωνίας</h3>
                        <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής Email"
                                type="email"
                                id='email'
                                name='email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                label='Email' />
                        </div>
                        {formik.errors.email && formik.touched.email &&
                            <small id="feedback" className="text-sm text-red-500">{formik.errors.email}</small>}

                    </li>
                    <li>
                        <h3 className='font-medium mt-8 mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τύπος παραστατικού</h3>
                        <Radio name="checkNote" id="receipt" value="Απόδειξη"
                            checked={!checkout.addresses.billing.isInvoice} onChange={onCheckNoteChange}></Radio>
                        <Radio name="checkNote" id="invoice" value="Τιμολόγιο"
                            checked={checkout.addresses.billing.isInvoice} onChange={onCheckNoteChange}></Radio>
                    </li>
                    <li>
                        <h3 className='font-medium mt-8 mb-6 border-b text-siteColors-purple dark:text-slate-200'>Διεύθυνση</h3>
                        <ul className="space-y-4">
                            {formik.values.isInvoice === true ?
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
                                    {!loading && <div className="relative rounded-lg border border-1 border-slate-300 bg-white appearance-none">
                                        <label htmlFor="country"
                                            className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Χώρα*</label>
                                        <select
                                            className='bg-transparent border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-300 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                            id='country'
                                            name='country'
                                            onChange={(e) => {
                                                formik.handleChange(e)
                                                formik.setFieldValue('state', "")
                                                const updateAddresses = { ...checkout.addresses, billing: { ...checkout.addresses.billing, country: e.target.value, state: '' } }
                                                dispatch({ type: "SAVE_ADDRESS", payload: updateAddresses })
                                                // saveAddresses({ ...addresses, billing: { ...addresses.billing, country: e.target.value, state: '' } })
                                            }}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.country}>
                                            <option value="">--Επέλεξε Χώρα--</option>
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
                                    <div className="relative rounded-lg border border-1 border-slate-300 bg-white appearance-none">
                                        <label htmlFor="state"
                                            className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Νομός*</label>
                                        <select
                                            className='bg-transparent border border-slate-300 text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-300 dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                            id='state'
                                            name='state'
                                            onChange={(e) => {
                                                formik.handleChange(e)
                                                formik.setFieldValue('city', "")
                                                dispatch({ type: "SAVE_ADDRESS", payload: { ...checkout.addresses, billing: { ...checkout.addresses.billing, state: e.target.value, city: '' } } })
                                            }}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.state}>
                                            <option value="">--Επέλεξε Νομό--</option>
                                            {!loadingState && states.countries.data.length > 0 &&
                                                states.countries.data[0].attributes.states.data.map(x => (
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
                                            className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Πόλη*</label>
                                        <select
                                            className='bg-transparent border border-gray-300 text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                            id='city'
                                            name='city'
                                            onChange={(e) => {
                                                formik.handleChange(e)
                                                formik.setFieldValue('zipCode', "")
                                                dispatch({ type: "SAVE_ADDRESS", payload: { ...checkout.addresses, billing: { ...checkout.addresses.billing, city: e.target.value, zipCode: '' } } })
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
                                            className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 slateeer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-plslateceholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Τ.Κ*</label>
                                        <input
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.zipCode}
                                            id='zipCode'
                                            name="zipCode"
                                            list="postals-list"
                                            className="block px-2.5 py-2.5 w-full text-sm text-slate-900 dark:text-slate-200 bg-transparent dark:bg-slate-700 focus:outline-none focus:ring-0 peer focus:ring-blue-500 focus:border-blue-500 rounded-lg" />
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
                    <li className="space-y-2">
                        <label htmlFor="deliveryNotes" className="text-sm tracking-wide ">Σχόλια</label>
                        <textarea
                            className="w-full p-4 dark:bg-slate-700"
                            id="deliveryNotes"
                            name="deliveryNotes"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.deliveryNotes}
                            rows={4}
                            maxLength={200} />
                    </li>
                    <li>
                        <div className='flex my-4'>
                            <input type='checkbox' id='different_shipping' name='different_shipping' checked={checkout.addresses.different_shipping} onChange={() => ondifferentAddressChange()} />
                            <label htmlFor='different_shipping' className="text-sm text-siteColors-purple dark:text-slate-200 ml-1">Θέλω να παραλάβω σε άλλη διεύθυνση.</label>
                        </div>
                        {formik.values.different_shipping && <>
                            <h3 className='font-medium mt-8 mb-6 border-b text-siteColors-purple dark:text-slate-200'>Διεύθυνση Αποστολής</h3>
                            <ul className="space-y-4">
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
                                                className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Χώρα*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-slate-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='ship_country'
                                                name='ship_country'
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    formik.setFieldValue('ship_state', "")
                                                    dispatch({ type: "SAVE_ADDRESS", payload: { ...checkout.addresses, shipping: { ...checkout.addresses.shipping, country: e.target.value, state: '' } } })
                                                }}
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
                                                className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Νομός*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-slate-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='ship_state'
                                                name='ship_state'
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    formik.setFieldValue('ship_city', "")
                                                    dispatch({ type: "SAVE_ADDRESS", payload: { ...checkout.addresses, shipping: { ...checkout.addresses.shipping, state: e.target.value, city: '' } } })
                                                }}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_state}>
                                                <option value="">--Επέλεξε Νομό--</option>
                                                {!loadingShipState && shipStates.countries.data.length > 0 && shipStates.countries.data[0].attributes.states.data.map(x => (
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
                                                className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Πόλη*</label>
                                            <select
                                                className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-slate-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"'
                                                id='ship_city'
                                                name='ship_city'
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    formik.setFieldValue('ship_zipCode', "")
                                                    dispatch({ type: "SAVE_ADDRESS", payload: { ...checkout.addresses, shipping: { ...checkout.addresses.shipping, city: e.target.value, zipCode: '' } } })
                                                }}
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
                                                className="absolute text-sm text-slate-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-transparent px-2 
                                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
                                     peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Τ.Κ*</label>
                                            <input
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.ship_zipCode}
                                                id='ship_zipCode'
                                                name="ship_zipCode"
                                                list="ship-postals-list"
                                                className="block px-2.5 py-2.5 w-full text-sm text-slate-900 dark:text-slate-200 bg-transparent dark:bg-slate-700 focus:outline-none focus:ring-0 peer focus:ring-blue-500 focus:border-blue-500" />
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
                        </>}
                    </li>
                </ul>
            </form>
        </section>
    )
})

Addresses.displayName = 'Addresses'

export default Addresses