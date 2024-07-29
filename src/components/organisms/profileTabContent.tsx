'use client'
import * as Yup from 'yup'
import { Formik, useFormik } from "formik";
import { useEffect } from 'react';
import { useApiRequest, useQuery } from '@/repositories/clientRepository';
import { mutate } from 'swr';
import { FaArrowDown } from 'react-icons/fa';
import Addresses from '../molecules/addresses';
import UserInfo from '../molecules/userInfo';

interface IProfile {
    user: {
        firstName: string;
        lastName: string;
        email: string
        telephone: string,
        mobilePhone: string,
        // shipping_address: {
        //     id: number,
        //     firstname: string,
        //     lastname: string,
        //     street: string,
        //     city: string,
        //     state: string,
        //     zipCode: number,
        //     country: string,
        //     afm: number,
        //     doy: string,
        //     companyName: string,
        //     businessActivity: string,
        //     title: string,
        //     invoice: boolean
        // }[],
        // billing_address: {
        //     id: number,
        //     firstname: string,
        //     lastname: string,
        //     street: string,
        //     city: string,
        //     state: string,
        //     zipCode: number,
        //     country: string,
        //     afm: number,
        //     doy: string,
        //     companyName: string,
        //     businessActivity: string,
        //     title: string,
        //     invoice: boolean
        // }[]
    }
}

export default function Profile({ user }: { user: any }) {


    const { data, loading, error }: { data: IProfile, loading: boolean, error: any } = useApiRequest({ api: "/api/user-address/getUser", jwt: `${user.jwt}` })

    // const initialValues: IProfile = {
    //     firstName: response.data?.user.firstName || "",
    //     lastName: response.data?.user.lastName || "",
    //     email: response.data?.user.email || "",
    //     telephone: response.data?.user.telephone || "",
    //     mobilePhone: response.data?.user.mobilePhone || "",
    //     shipping_address: response.data?.user.shipping_address || [],
    //     billing_address: response.data?.user.billing_address || [],
    // }

    // const formik = useFormik({
    //     initialValues: initialValues,
    //     // enableReinitialize: true,
    //     validationSchema: Yup.object({
    //         firstName: Yup.string(),
    //         lastName: Yup.string(),
    //         email: Yup.string()
    //             .email('*Το email δεν είναι σωστό!!!')
    //             .required('*To email είναι υποχρεωτικό πεδίο!'),
    //         // password: Yup.string().required("*Συμπληρώστε τον κωδικό σας!"),
    //     }),
    //     onSubmit: (values) => {
    //         // console.log("values:",values)
    //         // signIn('Credentials',values)
    //     }
    // });

    return (
        <div>
            {loading && !data ? <div>Loading</div> :
            <UserInfo user={user} data={data} />
                // <div>
                    
                //     {/* <div className='grid grid-cols-2 gap-8 mt-4'>
                //         <div>
                //             <h3 className='uppercase font-semibold text-siteColors-blue'>Διευθύνσεις Χρέωσης</h3>
                //             <div>
                //                 {data?.user.billing_address.map(address => (
                //                     <Addresses key={address.id} address={address} type="billing" />
                //                 ))}
                //             </div>
                //         </div>
                //         <div>
                //             <h3 className='uppercase font-semibold text-siteColors-blue'>Διευθύνσεις Αποστολής</h3>
                //             <div className='space-y-8'>
                //                 {data?.user.shipping_address.map(address => (
                //                     <Addresses key={address.id} address={address} type="shipping" />
                //                 ))}
                //             </div>
                //         </div>
                //     </div> */}
                // </div>
                }
            {/* // <Formik className='grid lg:grid-cols-2 gap-4 m-4 p-4 bg-slate-50'
                //     initialValues={initialValues}
                //     // enableReinitialize: true,
                //     validationSchema={Yup.object({
                //         firstName: Yup.string(),
                //         lastName: Yup.string(),
                //         email: Yup.string()
                //             .email('*Το email δεν είναι σωστό!!!')
                //             .required('*To email είναι υποχρεωτικό πεδίο!'),
                //         // password: Yup.string().required("*Συμπληρώστε τον κωδικό σας!"),
                //     })}
                //     onSubmit={async (values) => {
                //         console.log(values)
                //         // alert(JSON.stringify(values, null, 2));
                //         const myHeaders = new Headers();
                //         myHeaders.append("authorization", `Bearer ${user.jwt}`);
                //         myHeaders.append("Content-Type", "application/json")
                //         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
                //             method: "PUT", // *GET, POST, PUT, DELETE, etc.
                //             // mode: "cors", // no-cors, *cors, same-origin
                //             // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                //             // credentials: "same-origin", // include, *same-origin, omit
                //             headers: myHeaders,
                //             body: JSON.stringify({
                //                 email: values.email,
                //                 firstName: values.firstName,
                //                 lastName: values.lastName,
                //                 telephone: values.telephone,
                //                 mobilePhone: values.mobilePhone,
                //             })
                //         });
                //         mutate("/api/user-address/getUser")
                //         // signIn('Credentials',values)
                //     }}>
                //     {props => (
                //         <form className='grid w-full gap-8 m-4 p-4 bg-slate-50 rounded'
                //             onSubmit={props.handleSubmit}>
                //             <div className='grid space-y-2'>
                //                 <h2 className='uppercase font-semibold text-siteColors-blue'>Βασικά στοιχεία</h2>
                //                 <ul className='grid grid-cols-2 gap-4'>
                //                     <li className='flex items-center'>
                //                         <label className='w-24 mr-4 text-sm font-semibold text-left' htmlFor='firstname'>Όνομα</label>
                //                         <input
                //                             className='border rounded-lg focus:ring-0 focus:outline-none row-span-2 p-2 w-full '
                //                             type="text"
                //                             id='firstName'
                //                             name='firstName'
                //                             placeholder='Όνομα'
                //                             onChange={props.handleChange}
                //                             onBlur={props.handleBlur}
                //                             value={props.values.firstName} />
                //                     </li>
                //                     <li className='flex items-center'>
                //                         <label className='w-24 mr-4 text-sm font-semibold text-left' htmlFor='lastName'>Επώνυμο</label>
                //                         <input
                //                             className='border rounded-lg focus:ring-0 focus:outline-none row-span-2 p-2 w-full '
                //                             type="text"
                //                             id='lastName'
                //                             name='lastName'
                //                             placeholder='Επώνυμο'
                //                             onChange={props.handleChange}
                //                             onBlur={props.handleBlur}
                //                             value={props.values.lastName} />
                //                     </li>
                //                     <li className='flex items-center'>
                //                         <label className='w-24 mr-4 text-sm font-semibold text-left' htmlFor='email'>Email</label>
                //                         <input
                //                             className='border rounded-lg focus:ring-0 focus:outline-none row-span-2 p-2 w-full '
                //                             type="email"
                //                             id='email'
                //                             name='email'
                //                             placeholder='Email'
                //                             onChange={props.handleChange}
                //                             onBlur={props.handleBlur}
                //                             value={props.values.email} />
                //                         {props.errors.email && <div id="feedback">{props.errors.email}</div>}
                //                     </li>
                //                     <li className='flex items-center'>
                //                         <label className='w-24 mr-4 text-sm font-semibold text-left' htmlFor='telephone'>Σταθερό</label>
                //                         <input
                //                             className='border rounded-lg focus:ring-0 focus:outline-none row-span-2 p-2 w-full '
                //                             type="tel"
                //                             id='telephone'
                //                             name='telephone'
                //                             placeholder='Σταθερό'
                //                             onChange={props.handleChange}
                //                             onBlur={props.handleBlur}
                //                             value={props.values.telephone} />
                //                     </li>
                //                     <li className='flex items-center'>
                //                         <label className='w-24 mr-4 text-sm font-semibold text-left' htmlFor='mobilePhone'>Κινητό</label>
                //                         <input
                //                             className='border rounded-lg focus:ring-0 focus:outline-none row-span-2 p-2 w-full '
                //                             type="tel"
                //                             id='mobilePhone'
                //                             name='mobilePhone'
                //                             placeholder='Κινητό'
                //                             onChange={props.handleChange}
                //                             onBlur={props.handleBlur}
                //                             value={props.values.mobilePhone} />
                //                     </li>
                //                 </ul>
                //             </div>
                //             <div className='grid grid-cols-2 gap-8 mt-4'>
                //                 <div>
                //                     <h3 className='uppercase font-semibold text-siteColors-blue'>Διευθύνσεις Χρέωσης</h3>
                //                     <div>
                //                         {props.values.billing_address.map(address => (
                //                             <Addresses key={address.id} props={props} address={address} />
                //                         ))}
                //                     </div>
                //                 </div>
                //                 <div>
                //                     <h3 className='uppercase font-semibold text-siteColors-blue'>Διευθύνσεις Αποστολής</h3>
                //                     <div className='space-y-8'>
                //                         {props.values.shipping_address.map(address => (
                //                             <Addresses key={address.id} props={props} address={address} />
                //                         ))}
                //                     </div>
                //                 </div>
                //             </div>
                //             <div>
                //                 <button
                //                     className='bg-siteColors-blue p-2 text-white rounded'
                //                     type="submit">Αποθήκευση</button>
                //             </div>
                //         </form>)}
                // </Formik>} */}
        </div >
    )
}