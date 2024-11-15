'use client'
import { createContext, useState } from 'react'

interface IMenuContext {
    isMenuOpen: boolean,
    isSearchOpen: boolean
    isCategoriesOpen: boolean,
    isSubCategoriesOpen: boolean,
    toggleMenuDrawer: () => void,
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

    const toggleMenuDrawer = () => {
        setIsMenuOpen(!isMenuOpen)

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
        setIsMenuOpen(true)
    }

    const closeMenuDrawer = () => {
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