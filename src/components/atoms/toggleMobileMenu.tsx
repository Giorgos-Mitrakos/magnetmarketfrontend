"use client"
import { MenuContext } from "@/context/menu"
import { useContext } from "react"
import { AiOutlineMenu } from "react-icons/ai"

interface ToggleMobileMenuProps {
    location?: 'top-left' | 'bottom-nav'
}

export const ToggleMobileMenu = ({ location = 'bottom-nav' }: ToggleMobileMenuProps) => {
    const { toggleMenuDrawer } = useContext(MenuContext)
    
    return (
        <button className='py-4 xs:px-4' onClick={() => toggleMenuDrawer(location)}>
            <AiOutlineMenu aria-label="Κύριο Μενού" />
        </button>
    )
}