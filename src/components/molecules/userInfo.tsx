import { Formik } from "formik";
import * as Yup from 'yup'
import { mutate } from 'swr';
import { json } from "stream/consumers";

interface IProfile {
    firstName: string;
    lastName: string;
    email: string
    telephone: string,
    mobilePhone: string,
    // shipping_address: {
    //     id: number,
    //     street: string,
    //     city: string,
    //     state: string,
    //     zipCode: number,
    //     country: string,
    //     afm: number,
    //     doy: string,
    //     companyName: string,
    //     businessActivity: string,
    //     title: string
    // }[],
    // billing_address: {
    //     id: number,
    //     street: string,
    //     city: string,
    //     state: string,
    //     zipCode: number,
    //     country: string,
    //     afm: number,
    //     doy: string,
    //     companyName: string,
    //     businessActivity: string,
    //     title: string
    // }[]
}

const UserInfo = ({ user, info }: any) => {
    const initialValues: IProfile = {
        firstName: info?.firstName || "",
        lastName: info?.lastName || "",
        email: info?.email || "",
        telephone: info?.telephone || "",
        mobilePhone: info?.mobilePhone || "",
    }

    return (
        <Formik
            initialValues={initialValues}
            // enableReinitialize: true,
            validationSchema={Yup.object({
                firstName: Yup.string(),
                lastName: Yup.string(),
                email: Yup.string()
                    .email('*Το email δεν είναι σωστό!!!')
                    .required('*To email είναι υποχρεωτικό πεδίο!'),
                // password: Yup.string().required("*Συμπληρώστε τον κωδικό σας!"),
            })}
            onSubmit={async (values) => {

                // console.log(values)
                // alert(JSON.stringify(values, null, 2));
                const myHeaders = new Headers();
                myHeaders.append("authorization", `Bearer ${user.jwt}`);
                myHeaders.append("Content-Type", "application/json")
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`, {
                    method: "PUT", // *GET, POST, PUT, DELETE, etc.
                    // mode: "cors", // no-cors, *cors, same-origin
                    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                    // credentials: "same-origin", // include, *same-origin, omit
                    headers: myHeaders,
                    body: JSON.stringify({
                        email: values.email,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        telephone: values.telephone,
                        mobilePhone: values.mobilePhone,
                    })
                }).then((res) => {
                    // console.log(res)
                    // setTimeout(() => alert(JSON.stringify(res)), 1000)
                    // alert(JSON.stringify(res))
                    mutate("/api/user-address/getUser")
                })


                // signIn('Credentials',values)
            }}>
            {props => (
                <form className='grid space-y-4 mx-2 p-4 bg-slate-50 rounded'
                    onSubmit={props.handleSubmit}>
                    <div className='grid space-y-2'>
                        <h2 className='uppercase font-semibold text-siteColors-blue'>Βασικά στοιχεία</h2>
                        <ul className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            <li className='grid space-y-1'>
                                <label className='labelForInputForms' htmlFor='firstname'>Όνομα</label>
                                <input
                                    className='inputForms'
                                    type="text"
                                    id='firstName'
                                    name='firstName'
                                    placeholder='Όνομα'
                                    onChange={props.handleChange}
                                    onBlur={props.handleBlur}
                                    value={props.values.firstName} />
                            </li>
                            <li className='grid space-y-1'>
                                <label className='labelForInputForms' htmlFor='lastName'>Επώνυμο</label>
                                <input
                                    className='inputForms'
                                    type="text"
                                    id='lastName'
                                    name='lastName'
                                    placeholder='Επώνυμο'
                                    onChange={props.handleChange}
                                    onBlur={props.handleBlur}
                                    value={props.values.lastName} />
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
                                    onChange={props.handleChange}
                                    onBlur={props.handleBlur}
                                    value={props.values.email} />
                                {props.errors.email && <div id="feedback">{props.errors.email}</div>}
                            </li>
                            <li className='grid space-y-1'>
                                <label className='labelForInputForms' htmlFor='telephone'>Σταθερό</label>
                                <input
                                    className='inputForms'
                                    type="tel"
                                    id='telephone'
                                    name='telephone'
                                    placeholder='Σταθερό'
                                    onChange={props.handleChange}
                                    onBlur={props.handleBlur}
                                    value={props.values.telephone} />
                            </li>
                            <li className='grid space-y-1'>
                                <label className='labelForInputForms' htmlFor='mobilePhone'>Κινητό</label>
                                <input
                                    className='inputForms'
                                    type="tel"
                                    id='mobilePhone'
                                    name='mobilePhone'
                                    placeholder='Κινητό'
                                    onChange={props.handleChange}
                                    onBlur={props.handleBlur}
                                    value={props.values.mobilePhone} />
                            </li>
                        </ul>
                    </div>
                    <div>
                        <button
                            className='bg-siteColors-blue hover:opacity-90 disabled:bg-gray-400 transition ease-in duration-200 p-2 text-white rounded'
                            type="submit"
                            disabled={props.isSubmitting}>Αποθήκευση</button>
                    </div>
                </form>)}
        </Formik>
    )
}

export default UserInfo