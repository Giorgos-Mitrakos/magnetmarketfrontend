'use client'
import { createContext, useState } from 'react'
import { trackMobileMenuToggle } from '@/lib/helpers/advanced-analytics'

interface IMenuContext {
    isMenuOpen: boolean,
    isSearchOpen: boolean
    isCategoriesOpen: boolean,
    isSubCategoriesOpen: boolean,
    toggleMenuDrawer: (location?: 'top-left' | 'bottom-nav') => void,
    toggleSearchDrawer: () => void,
    openMenuDrawer: () => void;
    closeMenuDrawer: () => void;
    openSearchDrawer: () => void;
    closeSearchDrawer: () => void;
    openCategoryDrawer: () => void;
    closeCategoryDrawer: () => void;
    openSubCategoryDrawer: () => void;
    closeSubCategoryDrawer: () => void;
    closeMenu: () => void;
}

export const MenuContext = createContext<IMenuContext>({
    isMenuOpen: false,
    isSearchOpen: false,
    isCategoriesOpen: false,
    isSubCategoriesOpen: false,
    toggleMenuDrawer: () => { },
    toggleSearchDrawer: () => { },
    openMenuDrawer: () => { },
    closeMenuDrawer: () => { },
    openSearchDrawer: () => { },
    closeSearchDrawer: () => { },
    openCategoryDrawer: () => { },
    closeCategoryDrawer: () => { },
    openSubCategoryDrawer: () => { },
    closeSubCategoryDrawer: () => { },
    closeMenu: () => { },
})

export const MenuProvider = ({ children }: any) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isSubCategoriesOpen, setIsSubCategoriesOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleMenuDrawer = (location: 'top-left' | 'bottom-nav' = 'bottom-nav') => {
        const nextState = !isMenuOpen
        
        // ✅ Track menu interaction with correct location
        trackMobileMenuToggle(
            nextState ? 'open' : 'close',
            location
        )
        
        setIsMenuOpen(nextState)
        isSubCategoriesOpen && closeSubCategoryDrawer()
        isCategoriesOpen && closeCategoryDrawer()
        isSearchOpen && closeSearchDrawer()
    }

    const toggleSearchDrawer = () => {
        setIsSearchOpen(!isSearchOpen)
        isSubCategoriesOpen && closeSubCategoryDrawer()
        isCategoriesOpen && closeCategoryDrawer()
        isMenuOpen && closeMenuDrawer()
    }

    const openSearchDrawer = () => {
        setIsSearchOpen(true)
    }

    const closeSearchDrawer = () => {
        setIsSearchOpen(false)
    }

    const openMenuDrawer = () => {
        // ✅ Track menu open
        trackMobileMenuToggle('open', 'top-left')
        setIsMenuOpen(true)
    }

    const closeMenuDrawer = () => {
        // ✅ Track menu close
        trackMobileMenuToggle('close', 'top-left')
        setIsMenuOpen(false)
    }

    const openCategoryDrawer = () => {
        setIsCategoriesOpen(true)
    }

    const closeCategoryDrawer = () => {
        setIsCategoriesOpen(false)
    }

    const openSubCategoryDrawer = () => {
        setIsSubCategoriesOpen(true)
    }

    const closeSubCategoryDrawer = () => {
        setIsSubCategoriesOpen(false)
    }

    const closeMenu = () => {
        // Don't track here - already tracked by toggleMenuDrawer
        setIsSubCategoriesOpen(false)
        setIsCategoriesOpen(false)
        setIsMenuOpen(false)
    }

    return (
        <MenuContext.Provider
            value={{
                isMenuOpen,
                isSearchOpen,
                isCategoriesOpen,
                isSubCategoriesOpen,
                toggleMenuDrawer,
                toggleSearchDrawer,
                openMenuDrawer,
                closeMenuDrawer,
                openSearchDrawer,
                closeSearchDrawer,
                openCategoryDrawer,
                closeCategoryDrawer,
                openSubCategoryDrawer,
                closeSubCategoryDrawer,
                closeMenu
            }}
        >
            {children}
        </MenuContext.Provider>
    );
};