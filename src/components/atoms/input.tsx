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
    label: string
}

const CustomInput = (props: ICustomInput) => {

    return (
        <div className="h-full w-full">
            <input
                className='block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                aria-label={props.aria_label}
                type={props.type}
                id={props.id}
                name={props.name}
                placeholder=''
                onChange={props.onChange}
                onBlur={props.onBlur}
                value={props.value}
            />
            <label htmlFor={props.name} className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-inherit dark:bg-gray-900 px-2 
            peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
             peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">{props.label}</label>

        </div>
    )
}

export default CustomInput;