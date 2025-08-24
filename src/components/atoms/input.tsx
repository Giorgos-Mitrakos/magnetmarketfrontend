'use client'

import { ChangeEvent, FocusEvent } from "react";

interface ICustomInput {
    aria_label: string,
    type: string,
    id: string,
    name: string,
    onChange: (e: ChangeEvent<any>) => void,
    onBlur: (e: FocusEvent<any, Element>) => void,
    value: string,
    label?: string
    error?: string
}

const CustomInput = (props: ICustomInput) => {

    return (
        <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                {props.label}
                            </label>
            <div className="h-full w-full relative rounded-lg border border-1 border-gray-300 bg-white appearance-none">
                <input
                    className='block rounded-lg px-2.5 pb-2.5 pt-4 w-full text-sm text-slate-900 dark:text-slate-200 bg-transparent dark:bg-slate-600 focus:outline-none focus:ring-0 peer focus:ring-blue-500 focus:border-blue-500'
                    aria-label={props.aria_label}
                    type={props.type}
                    id={props.id}
                    name={props.name}
                    placeholder=''
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    value={props.value}
                />
                {/* <label htmlFor={props.name} className="absolute text-sm text-gray-500 dark:text-slate-200 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-inherit dark:bg-inherit px-2 
            peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-slate-300 
             peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">{props.label}</label> */}

            </div>
            {props.error !== undefined && <small id="feedback" className="text-sm text-red-500">{props.error}</small>}
        </div>
    )
}

export default CustomInput;