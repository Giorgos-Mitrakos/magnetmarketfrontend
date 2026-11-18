"use client"
// (2026-10-24) Στοιχεία παράδοσης (βήμα 1 του ταμείου):
//  - κινητό / τηλέφωνο / Τ.Κ. / Α.Φ.Μ. με σωστό έλεγχο (κενά, +30, ψηφίο ελέγχου Α.Φ.Μ.)
//    και καθαρισμό πριν αποθηκευτούν
//  - τα πεδία της «άλλης διεύθυνσης» ελέγχονται μόνο όταν είναι ανοιχτή
//  - αυτόματη συμπλήρωση του browser και αριθμητικό πληκτρολόγιο στο κινητό
//  - μόνο Ελλάδα: η χώρα συμπληρώνεται μόνη της
//  - σε λάθος, μεταφορά στο πρώτο πεδίο με πρόβλημα
import { useFormik } from "formik"
import PostalSuggestions from '@/components/atoms/PostalSuggestions'
import * as Yup from 'yup'
import Radio from "../atoms/radio"
import CustomInput from "../atoms/input"
import { forwardRef, useImperativeHandle, useCallback } from "react"
import { useGeo } from "@/hooks/useGeo"
import { useCheckout } from "@/context/checkout"
import { ICountries, ICustomerInfo, IRegionPostals, IRegions, IStates } from "@/lib/interfaces/addresses"
import { IProfile } from "./checkout/CustomerInfoClient"

export type FormInputRef = {
    /** Έλεγχος + αποθήκευση· true όταν τα στοιχεία είναι σωστά και αποθηκεύτηκαν */
    submitForm: () => Promise<boolean>;
    isSubmitting: boolean
};

const DEFAULT_COUNTRY = 'Ελλάδα'

/** Χωρίς κενά / παύλες / τελείες / παρενθέσεις */
const compact = (v?: string | null) => String(v ?? '').replace(/[\s\-.()/]/g, '')

/** Τηλέφωνο: χωρίς κενά και χωρίς πρόθεμα χώρας (+30 / 0030) */
export function normalizePhone(v?: string | null) {
    let d = compact(v)
    if (d.startsWith('+30')) d = d.slice(3)
    else if (d.startsWith('0030')) d = d.slice(4)
    return d
}

/** Ελληνικό Α.Φ.Μ.: 9 ψηφία με σωστό ψηφίο ελέγχου (προαιρετικό πρόθεμα EL) */
export function normalizeAfm(v?: string | null) {
    return compact(v).toUpperCase().replace(/^(EL|GR)/, '')
}
export function isValidAfm(v?: string | null) {
    const afm = normalizeAfm(v)
    if (!/^\d{9}$/.test(afm) || afm === '000000000') return false
    let sum = 0
    for (let i = 0; i < 8; i++) sum += Number(afm[i]) * 2 ** (8 - i)
    return (sum % 11) % 10 === Number(afm[8])
}

const MOBILE_MSG = 'Το κινητό έχει 10 ψηφία'
const PHONE_MSG = 'Το τηλέφωνο έχει 10 ψηφία'
const ZIP_MSG = 'Ο Τ.Κ. έχει 5 ψηφία'
const isMobile = (v?: string) => /^\d{10}$/.test(normalizePhone(v))
const isPhone = (v?: string) => /^\d{10}$/.test(normalizePhone(v))
const isZip = (v?: string) => /^\d{5}$/.test(compact(v))

/** Σειρά των πεδίων στη φόρμα — για τη μετάβαση στο πρώτο λάθος */
const FIELD_ORDER = [
    'email', 'companyName', 'businessActivity', 'afm', 'doy', 'firstname', 'lastname', 'street',
    'country', 'state', 'city', 'zipCode', 'telephone', 'mobilePhone',
    'ship_firstname', 'ship_lastname', 'ship_street', 'ship_country', 'ship_state', 'ship_city',
    'ship_zipCode', 'ship_telephone', 'ship_mobilePhone',
]

function focusFirstError(errors: Record<string, unknown>) {
    const first = FIELD_ORDER.find((k) => errors[k])
    const el = first ? document.getElementById(first) : null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ;(el as HTMLElement).focus({ preventScroll: true })
}

const Addresses = forwardRef<FormInputRef, IProfile>((props, ref) => {
    const { checkout, dispatch } = useCheckout()
    const { data: countriesData, loading, error } = useGeo('countries')

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
        country: props.user?.billing_address?.country || checkout.addresses.billing.country || DEFAULT_COUNTRY,
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
        ship_country: props.user?.shipping_address?.country || checkout.addresses.shipping.country || DEFAULT_COUNTRY,
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
            zipCode: Yup.string().required('*Yποχρεωτικό πεδίο!').test('zip', ZIP_MSG, (v) => !v || isZip(v)),
            telephone: Yup.string().notRequired().test('phone', PHONE_MSG, (v) => !v || isPhone(v)),
            mobilePhone: Yup.string().required('*Yποχρεωτικό πεδίο!').test('mobile', MOBILE_MSG, (v) => !v || isMobile(v)),
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
                then: (schema) => schema
                    .required('*Τό Α.Φ.Μ. της εταιρίας είναι υποχρεωτικό πεδίο!')
                    .test('afm', 'Μη έγκυρο Α.Φ.Μ. — ελέγξτε τα 9 ψηφία', (v) => !v || isValidAfm(v))
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
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!').test('zip', ZIP_MSG, (v) => !v || isZip(v))
            }),
            ship_country: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!')
            }),
            // Τα πεδία της άλλης διεύθυνσης ελέγχονται ΜΟΝΟ όταν είναι ανοιχτή
            ship_telephone: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.notRequired().test('phone', PHONE_MSG, (v) => !v || isPhone(v))
            }),
            ship_mobilePhone: Yup.string().when("different_shipping", {
                is: true,
                then: (schema) => schema.required('*Yποχρεωτικό πεδίο!').test('mobile', MOBILE_MSG, (v) => !v || isMobile(v))
            }),
        }),
        onSubmit: (values) => {
            const addresses = {
                different_shipping: values.different_shipping,
                deliveryNotes: values.deliveryNotes,
                billing: {
                    isInvoice: values.isInvoice,
                    email: String(values.email ?? '').trim(),
                    firstname: values.firstname,
                    lastname: values.lastname,
                    street: values.street,
                    city: values.city,
                    state: values.state,
                    zipCode: compact(values.zipCode),
                    country: values.country,
                    telephone: normalizePhone(values.telephone),
                    mobilePhone: normalizePhone(values.mobilePhone),
                    afm: values.isInvoice ? normalizeAfm(values.afm) : values.afm,
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
                    zipCode: compact(values.ship_zipCode),
                    country: values.ship_country,
                    telephone: normalizePhone(values.ship_telephone),
                    mobilePhone: normalizePhone(values.ship_mobilePhone),
                }
            }
            dispatch({ type: "SAVE_ADDRESS", payload: addresses })
        }
    });

    useImperativeHandle(ref, () => ({
        submitForm: async () => {
            const errors = await formik.validateForm()
            if (Object.keys(errors).length) {
                // Όλα «touched» ώστε να φανούν τα μηνύματα, και μετάβαση στο πρώτο λάθος
                formik.setTouched(Object.fromEntries(Object.keys(formik.values).map((k) => [k, true])), false)
                focusFirstError(errors as Record<string, unknown>)
                return false
            }
            await formik.submitForm()
            return true
        },
        resetForm: () => {
            formik.resetForm();
        },
        isSubmitting: formik.isSubmitting
    }));

    const { data: stateData, loading: loadingState } = useGeo('states', { country: formik.values.country })
    const { data: regionData, loading: loadingRegions } = useGeo('regions', { state: formik.values.state })
    const { data: postalData, loading: loadingPostals } = useGeo('postals', { region: formik.values.city, state: formik.values.state })

    const { data: shipStateData, loading: loadingShipState } = useGeo('states', { country: formik.values.ship_country })
    const { data: shipRegionData, loading: loadingShipRegions } = useGeo('regions', { state: formik.values.ship_state })
    const { data: shipPostalData, loading: loadingShipPostals } = useGeo('postals', { region: formik.values.ship_city, state: formik.values.ship_state })

    // Μόνο μία χώρα (Ελλάδα): χωρίς επιλογή — συμπληρώνεται μόνη της
    const singleCountry = (countries?.countries?.data?.length ?? 0) <= 1
    const states = stateData as IStates
    const regions = regionData as IRegions
    const postals = postalData as IRegionPostals
    const shipStates = shipStateData as IStates
    const shipRegions = shipRegionData as IRegions
    const shipPostals = shipPostalData as IRegionPostals

    // FIXED: Remove dispatch calls from onChange handlers to prevent focus loss
    // Σταθερές συναρτήσεις του formik (όχι ολόκληρο το formik στα deps)
    const { handleChange, setFieldValue } = formik

    const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>, isShipping: boolean = false) => {
        handleChange(e)
        setFieldValue(isShipping ? 'ship_state' : 'state', "")
    }, [handleChange, setFieldValue])

    const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>, isShipping: boolean = false) => {
        handleChange(e)
        setFieldValue(isShipping ? 'ship_city' : 'city', "")
    }, [handleChange, setFieldValue])

    const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>, isShipping: boolean = false) => {
        handleChange(e)
        setFieldValue(isShipping ? 'ship_zipCode' : 'zipCode', "")
    }, [handleChange, setFieldValue])

    const isInvoiceValue = formik.values.isInvoice
    const onCheckNoteChange = useCallback(() => {
        setFieldValue('isInvoice', !isInvoiceValue)
    }, [isInvoiceValue, setFieldValue])

    const differentShippingValue = formik.values.different_shipping
    const onDifferentAddressChange = useCallback(() => {
        setFieldValue('different_shipping', !differentShippingValue)
    }, [differentShippingValue, setFieldValue])

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
                            autoComplete="email"
                            inputMode="email"
                            hint="Εδώ θα λάβετε την επιβεβαίωση και την ενημέρωση για την αποστολή"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            label='Email*'
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
                                    autoComplete="organization"
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
                                    autoComplete="off"
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
                                    autoComplete="off"
                                    inputMode="numeric"
                                    maxLength={12}
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
                                    autoComplete="off"
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
                                    autoComplete="given-name"
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
                                    autoComplete="family-name"
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
                                autoComplete="address-line1"
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
                            {singleCountry ? (
                                <p id='country' tabIndex={-1} className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">{formik.values.country || DEFAULT_COUNTRY}</p>
                            ) : (
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
                            )}
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

                        <div className="relative">
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Τ.Κ*
                            </label>
                            <input
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.zipCode}
                                id='zipCode'
                                name="zipCode"
                                autoComplete="postal-code"
                                inputMode="numeric"
                                maxLength={6}
                                aria-invalid={!!(formik.errors.zipCode && formik.touched.zipCode) || undefined}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                placeholder="Εισάγετε Τ.Κ."
                            />
                            <PostalSuggestions
                                inputId="zipCode"
                                codes={postals?.regions?.data[0]?.attributes.postal_codes.data.map(p => p.attributes.postal.toString()) ?? []}
                                value={formik.values.zipCode}
                                onPick={(c) => formik.setFieldValue('zipCode', c)}
                            />
                            {formik.errors.zipCode && formik.touched.zipCode && (
                                <small className="text-sm text-red-500 mt-1 block">{formik.errors.zipCode}</small>
                            )}
                        </div>

                        <div>
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής τηλεφώνου"
                                type="tel"
                                id='telephone'
                                name='telephone'
                                autoComplete="tel-national"
                                inputMode="tel"
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
                                type="tel"
                                id='mobilePhone'
                                name='mobilePhone'
                                autoComplete="tel-national"
                                inputMode="tel"
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
                                        autoComplete="shipping given-name"
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
                                        autoComplete="shipping family-name"
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
                                        autoComplete="shipping address-line1"
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
                                    {singleCountry ? (
                                        <p id='ship_country' tabIndex={-1} className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">{formik.values.ship_country || DEFAULT_COUNTRY}</p>
                                    ) : (
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
                                    )}
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

                                <div className="relative">
                                    <label htmlFor="ship_zipCode" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Τ.Κ*
                                    </label>
                                    <input
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.ship_zipCode}
                                        id='ship_zipCode'
                                        name="ship_zipCode"
                                        autoComplete="shipping postal-code"
                                        inputMode="numeric"
                                        maxLength={6}
                                        aria-invalid={!!(formik.errors.ship_zipCode && formik.touched.ship_zipCode) || undefined}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors"
                                        placeholder="Εισάγετε Τ.Κ."
                                    />
                                    <PostalSuggestions
                                        inputId="ship_zipCode"
                                        codes={shipPostals?.regions?.data[0]?.attributes.postal_codes.data.map(p => p.attributes.postal.toString()) ?? []}
                                        value={formik.values.ship_zipCode}
                                        onPick={(c) => formik.setFieldValue('ship_zipCode', c)}
                                    />
                                    {formik.errors.ship_zipCode && formik.touched.ship_zipCode && (
                                        <small className="text-sm text-red-500 mt-1 block">{formik.errors.ship_zipCode}</small>
                                    )}
                                </div>

                                <div>
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής τηλεφώνου"
                                        type="tel"
                                        id='ship_telephone'
                                        name='ship_telephone'
                                        autoComplete="off"
                                        inputMode="tel"
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
                                        type="tel"
                                        id='ship_mobilePhone'
                                        name='ship_mobilePhone'
                                        autoComplete="off"
                                        inputMode="tel"
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
