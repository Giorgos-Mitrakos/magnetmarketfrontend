// MainMenu.tsx
'use client'
import { IImageAttr } from "@/lib/interfaces/image";
import Link from "next/link";
import { useState } from "react";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";

export interface MenuData {
    id: number;
    slug: string;
    name: string;
    image: IImageAttr
    categories: {
        id: number;
        slug: string;
        name: string;
        image: IImageAttr
        categories: {
            id: number;
            slug: string;
            name: string;
            image: IImageAttr
        }[]
    }[];
}

interface MainMenuProps {
    isMenuOpen: boolean;
    menuData: MenuData[]; // Προ-φορτωμένα δεδομένα
}

const MainMenu = ({ isMenuOpen, menuData }: MainMenuProps) => {
    const [activeCategory, setActiveCategory] = useState("");

    if (!isMenuOpen) return null;

    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl dark:shadow-slate-900/50 rounded-b-md border border-slate-200 dark:border-slate-700">
            <div className="p-4" style={{ width: 'max-content', minWidth: '100%' }}>
                <div className="flex">
                    {/* Main Categories Column */}
                    <div className="w-64 border-r border-slate-200 dark:border-slate-700 pr-4">
                        <ul className="flex flex-col">
                            {menuData && menuData.map(cat => (
                                cat.name !== "Uncategorized" &&
                                <li
                                    className={`group flex justify-between items-center px-4 py-3 text-sm cursor-pointer rounded-lg transition-all duration-200 
                                              ${activeCategory === cat.slug ?
                                            'bg-siteColors-lightblue/10 text-siteColors-lightblue dark:bg-siteColors-lightblue/20 dark:text-white' :
                                            'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'}`}
                                    key={cat.slug}
                                    onMouseEnter={() => setActiveCategory(cat.slug)}
                                >
                                    <Link
                                        href={`/category/${cat.slug}`}
                                        className="flex-1"
                                    >
                                        <h3 className="font-medium">{cat.name}</h3>
                                    </Link>
                                    {cat.categories?.length > 0 &&
                                        <FaAngleRight className="text-slate-400 dark:text-slate-400 group-hover:text-siteColors-lightblue dark:group-hover:text-white transition-colors" />}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Subcategories Panel */}
                    <div className="flex-1 pl-6">
                        {menuData && menuData.map(cat => (
                            <div
                                key={cat.slug}
                                className={`transition-opacity duration-300 ${activeCategory === cat.slug ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
                            >
                                {cat.categories?.length > 0 ? (
                                    <>
                                        <div className="flex items-center pb-4">
                                            <h2 className="text-xl font-bold text-siteColors-blue dark:text-white">
                                                {cat.name}
                                            </h2>
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                className="ml-4 text-sm text-siteColors-lightblue hover:underline flex items-center"
                                            >
                                                View all
                                                <FaAngleDown className="ml-1 transform rotate-270" />
                                            </Link>
                                        </div>

                                        <div className="flex flex-wrap gap-6">
                                            {cat.categories.map(sub => (
                                                <div key={sub.slug} className="mb-6 min-w-[180px] max-w-[220px]">
                                                    <Link href={`/category/${cat.slug}/${sub.slug}`}>
                                                        <h3 className="text-lg font-semibold text-siteColors-purple dark:text-siteColors-lightblue mb-3 pb-2 border-b border-siteColors-lightblue/20 dark:border-siteColors-lightblue/40">
                                                            {sub.name}
                                                        </h3>
                                                    </Link>
                                                    <ul className="space-y-2">
                                                        {sub.categories?.map(sub2 => (
                                                            <li key={sub2.slug}>
                                                                <Link
                                                                    href={`/category/${cat.slug}/${sub.slug}/${sub2.slug}`}
                                                                    className="text-sm text-slate-700 dark:text-slate-300 hover:text-siteColors-lightblue transition-colors duration-200 block py-1"
                                                                >
                                                                    {sub2.name}
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
                                            {cat.name}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            Explore our selection of {cat.name}
                                        </p>
                                        <Link
                                            href={`/category/${cat.slug}`}
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
    );
};

export default MainMenu;