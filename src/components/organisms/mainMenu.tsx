'use client'
import { IMenuProps } from "@/lib/interfaces/category";
import { GET_MENU } from "@/lib/queries/categoryQuery";
import { useNoRevalideteQuery } from "@/repositories/clientRepository";
import Link from "next/link";
import { useState } from "react";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";

const MainMenu = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
    const [activeCategory, setActiveCategory] = useState("");
    const { data: menuData, loading, error } = useNoRevalideteQuery({ query: GET_MENU, jwt: '' })
    const menu = menuData as IMenuProps

    if (!isMenuOpen) return null;

    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl dark:shadow-slate-900/50 rounded-b-md border border-slate-200 dark:border-slate-700">
            <div className="p-4" style={{ width: 'max-content', minWidth: '100%' }}>
                <div className="flex">
                    {/* Main Categories Column */}
                    <div className="w-64 border-r border-slate-200 dark:border-slate-700 pr-4">
                        <ul className="flex flex-col">
                            {menu && menu.categories.data.map(cat => (
                                cat.attributes.name !== "Uncategorized" &&
                                <li
                                    className={`group flex justify-between items-center px-4 py-3 text-sm cursor-pointer rounded-lg transition-all duration-200 
                                              ${activeCategory === cat.attributes.slug ?
                                            'bg-siteColors-lightblue/10 text-siteColors-lightblue dark:bg-siteColors-lightblue/20 dark:text-white' :
                                            'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'}`}
                                    key={cat.attributes.slug}
                                    onMouseEnter={() => setActiveCategory(cat.attributes.slug)}
                                >
                                    <Link
                                        href={`/category/${cat.attributes.slug}`}
                                        className="flex-1"
                                    >
                                        <h3 className="font-medium">{cat.attributes.name}</h3>
                                    </Link>
                                    {cat.attributes.categories.data.length > 0 &&
                                        <FaAngleRight className="text-slate-400 dark:text-slate-400 group-hover:text-siteColors-lightblue dark:group-hover:text-white transition-colors" />}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Subcategories Panel */}
                    <div className="flex-1 pl-6">
                        {menu && menu.categories.data.map(cat => (
                            <div
                                key={cat.attributes.slug}
                                className={`transition-opacity duration-300 ${activeCategory === cat.attributes.slug ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
                            >
                                {cat.attributes.categories.data.length > 0 ? (
                                    <>
                                        <div className="flex items-center pb-4">
                                            <h2 className="text-xl font-bold text-siteColors-blue dark:text-white">
                                                {cat.attributes.name}
                                            </h2>
                                            <Link
                                                href={`/category/${cat.attributes.slug}`}
                                                className="ml-4 text-sm text-siteColors-lightblue hover:underline flex items-center"
                                            >
                                                View all
                                                <FaAngleDown className="ml-1 transform rotate-270" />
                                            </Link>
                                        </div>

                                        <div className="flex flex-wrap gap-6">
                                            {cat.attributes.categories.data.map(sub => (
                                                <div key={sub.attributes.slug} className="mb-6 min-w-[180px] max-w-[220px]">
                                                    <Link href={`/category/${cat.attributes.slug}/${sub.attributes.slug}`}>
                                                        <h3 className="text-lg font-semibold text-siteColors-purple dark:text-siteColors-lightblue mb-3 pb-2 border-b border-siteColors-lightblue/20 dark:border-siteColors-lightblue/40">
                                                            {sub.attributes.name}
                                                        </h3>
                                                    </Link>
                                                    <ul className="space-y-2">
                                                        {sub.attributes.categories.data.map(sub2 => (
                                                            <li key={sub2.attributes.slug}>
                                                                <Link
                                                                    href={`/category/${cat.attributes.slug}/${sub.attributes.slug}/${sub2.attributes.slug}`}
                                                                    className="text-sm text-slate-700 dark:text-slate-300 hover:text-siteColors-lightblue transition-colors duration-200 block py-1"
                                                                >
                                                                    {sub2.attributes.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center">
                                        <h2 className="text-xl font-bold text-siteColors-blue dark:text-white mb-2">
                                            {cat.attributes.name}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            Explore our selection of {cat.attributes.name}
                                        </p>
                                        <Link
                                            href={`/category/${cat.attributes.slug}`}
                                            className="inline-flex items-center px-4 py-2 bg-siteColors-lightblue text-white rounded-md hover:bg-siteColors-blue transition-colors"
                                        >
                                            Browse all
                                            <FaAngleRight className="ml-2" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainMenu