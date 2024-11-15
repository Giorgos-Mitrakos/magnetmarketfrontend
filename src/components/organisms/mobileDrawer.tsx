"use client"

import { GET_MENU, IMenuProps, IMenuSub2CategoryProps } from "@/lib/queries/categoryQuery"
import { useNoRevalideteQuery } from "@/repositories/clientRepository"
import Link from "next/link"
import { SetStateAction, useContext, useEffect, useState } from "react"
import NextImage from "../atoms/nextImage"
import { FaArrowLeftLong } from "react-icons/fa6";
import { MenuContext } from "@/context/menu"

interface IMenuCategoryProps {
    attributes: {
        name: string
        slug: string
        image: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        }
        categories: { data: IMenuSubCategoryProps[] }
    }
}

interface IMenuSubCategoryProps {
    attributes: {
        name: string
        slug: string
        image: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        }
        categories: IMenuSub2CategoryProps
    }
}

function Sub2categoryDrawer({ category, subcategory }:
    {
        category: string, subcategory: IMenuSubCategoryProps | null
    }) {

    const { closeMenu, closeSubCategoryDrawer } = useContext(MenuContext)

    return (
        <div className="h-screen absolute top-0">
            <div className="p-4">
            <h2 className="text-lg text-center text-white rounded font-semibold mb-4 bg-siteColors-blue p-2">Κατηγορίες</h2>
                <h3 className="text text-center rounded font-semibold">{subcategory?.attributes.name}</h3>
                <button className="flex items-center px-4 w-auto text-sm mb-4"
                    onClick={() => closeSubCategoryDrawer()} ><FaArrowLeftLong className="w-4 h-4 mr-2" /> Πίσω</button>
                <ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 place-items-center">
                    {subcategory && subcategory.attributes.categories.data.map(cat => (
                        cat.attributes.name !== "Uncategorized" &&
                        <li className="text-siteColors-blue cursor-pointer h-full" key={cat.attributes.slug}>
                            <Link onClick={() => closeMenu()} href={`/category/${category}/${subcategory.attributes.slug}/${cat.attributes.slug}`}>
                                <div className="flex flex-col justify-between items-center ">
                                    <p className="rounded-full w-24 h-24 border-2 p-4 bg-white hover:shadow">
                                        <NextImage media={cat.attributes.image.data.attributes} width={80} height={80} />
                                    </p>
                                    <p className="break-words text-wrap text-center text-sm ">{cat.attributes.name}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function SubcategoryDrawer({ category }: {
    category: IMenuCategoryProps | null
}) {

    const { isSubCategoriesOpen, openSubCategoryDrawer, closeCategoryDrawer } = useContext(MenuContext)
    const [subCategory, setSubCategory] = useState<IMenuSubCategoryProps | null>(null)

    const handleOnclickSub = (category: IMenuSubCategoryProps) => {
        setSubCategory(category)
        openSubCategoryDrawer()
    }

    return (
        <div className="h-screen">
            {category && isSubCategoriesOpen && <div className={`absolute lg:hidden bottom-0 left-0 z-30 h-full w-full shadow-lg bg-blue-100
            transition-transform transform ${isSubCategoriesOpen ? "translate-x-0" :
                    "-translate-x-full"} duration-500`}>
                <Sub2categoryDrawer category={category.attributes.slug} subcategory={subCategory} />
            </div>}
            <div className="p-4">
                <h2 className="text-lg text-center text-white rounded font-semibold mb-4 bg-siteColors-blue p-2">Κατηγορίες</h2>
                <h3 className="text text-center rounded font-semibold">{category?.attributes.name}</h3>
                <button className="flex items-center w-auto text-sm px-4 mb-4"
                    onClick={() => closeCategoryDrawer()} ><FaArrowLeftLong className="w-4 h-4 mr-2" /> Πίσω</button>
                <ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 grid-rows-[max-content] gap-4 place-items-center">
                    {category && category.attributes.categories.data.map(cat => (
                        cat.attributes.name !== "Uncategorized" &&
                        <li className="text-siteColors-blue cursor-pointer h-full" key={cat.attributes.slug}>
                            <button onClick={() => handleOnclickSub(cat)}>
                                <div className="flex flex-col items-center">
                                    <p className="flex rounded-full w-24 h-24 border-2 p-4 bg-white items-center hover:shadow-sm">
                                        <NextImage media={cat.attributes.image.data.attributes} width={80} height={80} />
                                    </p>
                                    <p className="break-words text-wrap text-center text-sm mt-2">{cat.attributes.name}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default function MobileDrawer() {
    const { isCategoriesOpen, openCategoryDrawer } = useContext(MenuContext)
    const { data: menuData, loading, error } = useNoRevalideteQuery({ query: GET_MENU, jwt: '' })

    const menu = menuData as IMenuProps

    const [category, setCategory] = useState<IMenuCategoryProps | null>(null)

    const handleOnclickSub = (category: IMenuCategoryProps) => {
        setCategory(category)
        openCategoryDrawer()
    }

    return (
        <div className="h-screen">
            {isCategoriesOpen && <div className={`absolute lg:hidden bottom-0 left-0 z-20 h-full w-full shadow-lg bg-blue-100
            transition-transform transform ${isCategoriesOpen ? "translate-x-0" :
                    "-translate-x-full"} duration-500`}>
                <SubcategoryDrawer category={category} />
            </div>}
            <div className="p-4">
                <h2 className="text-lg text-center text-white rounded font-semibold mb-8 bg-siteColors-blue p-2">Κατηγορίες</h2>
                <ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 place-items-center">
                    {menu && menu.categories.data.map(cat => (
                        cat.attributes.name !== "Uncategorized" &&
                        <li className="text-siteColors-blue cursor-pointer h-full" key={cat.attributes.slug}>
                            <button onClick={() => handleOnclickSub(cat)}>
                                <div className="flex flex-col justify-between items-center ">
                                    <p className="rounded-full w-24 h-24 border-2 p-4 bg-white hover:shadow-sm">
                                        <NextImage media={cat.attributes.image.data.attributes} width={80} height={80} />
                                    </p>
                                    <p className="break-words text-wrap text-center text-sm ">{cat.attributes.name}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}