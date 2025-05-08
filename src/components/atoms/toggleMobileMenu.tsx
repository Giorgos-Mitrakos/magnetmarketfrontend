"use client"

import { MenuContext } from "@/context/menu"
import { useContext } from "react"
import { AiOutlineMenu } from "react-icons/ai"


export const ToggleMobileMenu = () => {

    const { toggleMenuDrawer } = useContext(MenuContext)
    return (
        <button className='py-4 xs:px-4' onClick={toggleMenuDrawer}>
            <AiOutlineMenu aria-label="Κύριο Μενού" />
        </button>
    )
}