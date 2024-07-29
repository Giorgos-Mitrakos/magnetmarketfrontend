"use client"
import { Field, Form, Formik, useFormik } from "formik"
import * as Yup from 'yup'
import Radio from "../atoms/radio"
import CustomInput from "../atoms/input"
import { useState } from "react"
import { IProfile } from "@/app/checkout/customer-informations/page"

const Addresses = (props: IProfile) => {

    const localAddresses = localStorage.getItem("addresses") ? JSON.parse(localStorage.getItem("addresses") || "") : null

    const [checkNote, setCheckNote] = useState<boolean>(localAddresses?.billing.isInvoice || false)
    const [differentAddress, setDifferentAddress] = useState<boolean>(localAddresses?.different_shipping || false)

    interface ICustomerInfo {
        id: number | string
        email: string;
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
        isInvoice: boolean;
        different_shipping: boolean;
        ship_firstname: string;
        ship_lastname: string;
        ship_street: string;
        ship_city: string;
        ship_state: string;
        ship_zipCode: string;
        ship_country: string;
        ship_telephone: string;
        ship_mobilePhone: string;
    }

    let initialValues: ICustomerInfo = {
        id: props.user?.info.id || "",
        email: props.user?.info.email,
        firstname: props.user?.billing_address[0]?.firstname || localAddresses?.billing.firstname || "",
        lastname: props.user?.billing_address[0]?.lastname || localAddresses?.billing.lastname || "",
        street: props.user?.billing_address[0]?.street || localAddresses?.billing.street || "",
        city: props.user?.billing_address[0]?.city || localAddresses?.billing.city || "",
        state: props.user?.billing_address[0]?.state || localAddresses?.billing.state || "",
        zipCode: props.user?.billing_address[0]?.zipCode || localAddresses?.billing.zipCode || "",
        country: props.user?.billing_address[0]?.country || localAddresses?.billing.country || 'Ελλάδα',
        telephone: props.user?.billing_address[0]?.telephone || localAddresses?.billing.telephone || "",
        mobilePhone: props.user?.billing_address[0]?.mobilePhone || localAddresses?.billing.mobilePhone || "",
        afm: props.user?.billing_address[0]?.afm || localAddresses?.billing.afm || "",
        doy: props.user?.billing_address[0]?.doy || localAddresses?.billing.doy || "",
        companyName: props.user?.billing_address[0]?.companyName || localAddresses?.billing.companyName || "",
        businessActivity: props.user?.billing_address[0]?.businessActivity || localAddresses?.billing.businessActivity || "",
        isInvoice: checkNote || localAddresses?.billing.isInvoice || false,
        different_shipping: localAddresses?.different_shipping || false,
        ship_firstname: props.user?.shipping_address[0]?.firstname || localAddresses?.shipping.firstname || "",
        ship_lastname: props.user?.shipping_address[0]?.lastname || localAddresses?.shipping.lastname || "",
        ship_street: props.user?.shipping_address[0]?.street || localAddresses?.shipping.street || "",
        ship_city: props.user?.shipping_address[0]?.city || localAddresses?.shipping.city || "",
        ship_state: props.user?.shipping_address[0]?.state || localAddresses?.shipping.state || "",
        ship_zipCode: props.user?.shipping_address[0]?.zipCode || localAddresses?.shipping.zipCode || "",
        ship_country: props.user?.shipping_address[0]?.country || localAddresses?.shipping.country || 'Ελλάδα',
        ship_telephone: props.user?.shipping_address[0]?.telephone || localAddresses?.shipping.telephone || "",
        ship_mobilePhone: props.user?.shipping_address[0]?.mobilePhone || localAddresses?.shipping.mobilePhone || "",
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            isInvoice: Yup.boolean(),
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
            // .email('*Το email δεν είναι σωστό!!!')
            // .required('*To email είναι υποχρεωτικό πεδίο!'),
            // password: Yup.string().required("*Συμπληρώστε τον κωδικό σας!"),
        }),
        onSubmit: (values) => {
            const addresses = {
                different_shipping: values.different_shipping,
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
            localStorage.setItem("addresses", JSON.stringify(addresses));
            console.log("addresses:", addresses)
            // cookies().set('addresses', JSON.stringify(addresses), { secure: true })
            // signIn('Credentials',values)
        }
    });

    const onCheckNoteChange = () => {
        setCheckNote(!checkNote)
        formik.values.isInvoice = !checkNote
    }

    const ondifferentAddressChange = () => {
        setDifferentAddress(!differentAddress)
        formik.values.different_shipping = !differentAddress
    }

    return (
        <section>
            <ul className='space-y-4 w-full p-4 bg-slate-50 rounded-lg' >
                <li>
                    <h3 className='font-medium mb-6 border-b text-siteColors-purple'>Στοιχεία επικοινωνίας</h3>
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
                    <h3 className='font-medium mt-8 mb-4 border-b text-siteColors-purple'>Τύπος παραστατικού</h3>
                    <Radio name="checkNote" id="receipt" label="Απόδειξη"
                        isChecked={!checkNote} onChange={onCheckNoteChange}></Radio>
                    <Radio name="checkNote" id="invoice" label="Τιμολόγιο"
                        isChecked={checkNote} onChange={onCheckNoteChange}></Radio>
                </li>
                <li>
                    <h3 className='font-medium mt-8 mb-6 border-b text-siteColors-purple'>Διεύθυνση</h3>
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
                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής Πόλης"
                                        type="text"
                                        id='city'
                                        name='city'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.city}
                                        label='Πόλη*' />
                                </div>
                                {formik.errors.city && formik.touched.city &&
                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.city}</small>}
                            </div>
                            <div>
                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής Νομού"
                                        type="text"
                                        id='state'
                                        name='state'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.state}
                                        label='Νομός*' />
                                </div>
                                {formik.errors.state && formik.touched.state &&
                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.state}</small>}
                            </div>
                        </li>
                        <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής Ταχυδρομικού κώδικα"
                                        type="text"
                                        id='zipCode'
                                        name='zipCode'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.zipCode}
                                        label='Τ.Κ.*' />
                                </div>
                                {formik.errors.zipCode && formik.touched.zipCode &&
                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.zipCode}</small>}
                            </div>
                            <div>
                                <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                    <CustomInput
                                        aria_label="Φόρμα εισαγωγής χώρας"
                                        type="text"
                                        id='country'
                                        name='country'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.country}
                                        label='Χώρα*' />
                                </div>
                                {formik.errors.country && formik.touched.country &&
                                    <small id="feedback" className="text-sm text-red-500">{formik.errors.country}</small>}
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
                        <input type='checkbox' id='different_shipping' name='different_shipping' checked={formik.values.different_shipping} onChange={() => ondifferentAddressChange()} />
                        <label htmlFor='different_shipping' className="text-sm text-siteColors-purple ml-1">Θέλω να παραλάβω σε άλλη διεύθυνση.</label>
                    </div>
                    {formik.values.different_shipping && <>
                        <h3 className='font-medium mt-8 mb-6 border-b text-siteColors-purple'>Διεύθυνση Αποστολής</h3>
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
                                    <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                        <CustomInput
                                            aria_label="Φόρμα εισαγωγής Πόλης"
                                            type="text"
                                            id='ship_city'
                                            name='ship_city'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.ship_city}
                                            label='Πόλη*' />
                                    </div>
                                    {formik.errors.ship_city && formik.touched.ship_city &&
                                        <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_city}</small>}
                                </div>
                                <div>
                                    <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                        <CustomInput
                                            aria_label="Φόρμα εισαγωγής Νομού"
                                            type="text"
                                            id='ship_state'
                                            name='ship_state'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.ship_state}
                                            label='Νομός*' />
                                    </div>
                                    {formik.errors.ship_state && formik.touched.ship_state &&
                                        <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_state}</small>}
                                </div>
                            </li>
                            <li className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                        <CustomInput
                                            aria_label="Φόρμα εισαγωγής Ταχυδρομικού κώδικα"
                                            type="text"
                                            id='ship_zipCode'
                                            name='ship_zipCode'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.ship_zipCode}
                                            label='Τ.Κ.*' />
                                    </div>
                                    {formik.errors.ship_zipCode && formik.touched.ship_zipCode &&
                                        <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_zipCode}</small>}
                                </div>
                                <div>
                                    <div className="relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                                        <CustomInput
                                            aria_label="Φόρμα εισαγωγής χώρας"
                                            type="text"
                                            id='ship_country'
                                            name='ship_country'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.ship_country}
                                            label='Χώρα*' />
                                    </div>
                                    {formik.errors.ship_country && formik.touched.ship_country &&
                                        <small id="feedback" className="text-sm text-red-500">{formik.errors.ship_country}</small>}
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
            <button onClick={formik.submitForm}>Submit</button>
        </section>
    )
}

export default Addresses