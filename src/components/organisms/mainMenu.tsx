'use client'
import { IImageAttr } from "@/lib/interfaces/image";
import Link from "next/link";
import { useState } from "react";
import { FaAngleRight, FaAngleDown, FaStar, FaFire, FaBolt } from "react-icons/fa6";

export interface MenuData {
    id: number;
    slug: string;
    name: string;
    description: string,
    image: IImageAttr
    isSpecial?: boolean;
    categories: {
        id: number;
        slug: string;
        name: string;
        description: string,
        image: IImageAttr
        isSpecial?: boolean;
        categories: {
            id: number;
            slug: string;
            name: string;
            description: string,
            image: IImageAttr
            isSpecial?: boolean;
        }[]
    }[];
}

interface MainMenuProps {
    isMenuOpen: boolean;
    menuData: MenuData[];
}

const MainMenu = ({ isMenuOpen, menuData }: MainMenuProps) => {
    const [activeCategory, setActiveCategory] = useState("");

    if (!isMenuOpen) return null;

    const regularCategories = menuData?.filter(cat => !cat.isSpecial) || [];
    const specialCategories = menuData?.filter(cat => cat.isSpecial) || [];

    return (
        <div className="bg-white dark:bg-slate-900 shadow-xl dark:shadow-slate-950/50 rounded-b-md border border-slate-200 dark:border-slate-700">
            <div className="p-4" style={{ width: 'max-content', minWidth: '100%' }}>
                <div className="flex">
                    {/* Main Categories Column */}
                    <div className="w-64 border-r border-slate-200 dark:border-slate-700 pr-4">
                        <ul className="flex flex-col">
                            {/* Ειδικές κατηγορίες πρώτες - ΒΕΛΤΙΩΜΕΝΟ CONTRAST DARK MODE */}
                            {specialCategories.map(cat => (
                                <li
                                    className="flex justify-between items-center px-4 py-3 text-sm cursor-pointer bg-gradient-to-r from-siteColors-pink to-siteColors-purple text-white rounded-lg mb-2 shadow-lg border-2 border-siteColors-pink/40 dark:border-siteColors-pink/60"
                                    key={cat.slug}
                                    onMouseEnter={() => setActiveCategory(cat.slug)}
                                >
                                    <Link
                                        href={`/category/${cat.slug}`}
                                        className="flex-1"
                                    >
                                        <div className="flex items-center">
                                            <div className="bg-white/20 dark:bg-white/30 p-1 rounded-lg mr-3">
                                                <FaBolt className="w-4 h-4 text-yellow-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{cat.name}</h3>
                                                <p className="text-white/90 dark:text-white/80 text-xs">{cat.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    {cat.categories?.length > 0 &&
                                        <FaAngleRight className="text-white/90 dark:text-white" />}
                                </li>
                            ))}

                            {/* Separator */}
                            {specialCategories.length > 0 && regularCategories.length > 0 && (
                                <div className="my-2 border-t border-slate-300 dark:border-slate-600"></div>
                            )}

                            {/* Κανονικές κατηγορίες - ΒΕΛΤΙΩΜΕΝΟ CONTRAST */}
                            {regularCategories.map(cat => (
                                cat.name !== "Uncategorized" &&
                                <li
                                    className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer border-b border-slate-100 dark:border-slate-600
                                              ${activeCategory === cat.slug ?
                                            'bg-siteColors-lightblue/10 dark:bg-siteColors-lightblue/20 text-siteColors-lightblue dark:text-siteColors-lightblue' :
                                            'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100'}`}
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
                                        <FaAngleRight className="text-slate-400 dark:text-slate-400" />}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Subcategories Panel - ΒΕΛΤΙΩΜΕΝΟ CONTRAST DARK MODE */}
                    <div className="flex-1 pl-6">
                        {/* Ειδικές κατηγορίες */}
                        {specialCategories.map(cat => (
                            <div
                                key={cat.slug}
                                className={`${activeCategory === cat.slug ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
                            >
                                <div className="mb-4">
                                    {/* Header - ΒΕΛΤΙΩΜΕΝΟ CONTRAST */}
                                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-siteColors-pink/20 dark:border-siteColors-pink/40">
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-r from-siteColors-pink to-siteColors-purple p-3 rounded-xl mr-4 shadow-lg">
                                                <FaFire className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-siteColors-purple dark:text-white">
                                                    {cat.name}
                                                </h2>
                                                <p className="text-siteColors-pink dark:text-siteColors-lightblue text-sm font-medium">{cat.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {cat.categories?.length > 0 ? (
                                        <div className="flex flex-wrap gap-8 mt-4">
                                            {cat.categories.map(sub => (
                                                <div key={sub.slug} className="flex-1 min-w-[200px] max-w-[300px]">
                                                    <Link href={`/category/${cat.slug}/${sub.slug}`}>
                                                        <div className="flex items-center mb-3 pb-2 border-b border-siteColors-pink/20 dark:border-siteColors-lightblue/40">
                                                            <FaStar className="w-4 h-4 mr-2 text-siteColors-pink dark:text-siteColors-lightblue" />
                                                            <div>
                                                                <h3 className="text-lg font-bold text-siteColors-purple dark:text-white">
                                                                    {sub.name}
                                                                </h3>
                                                                <p className="text-siteColors-pink dark:text-siteColors-lightblue text-sm">{sub.description}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <ul className="space-y-1">
                                                        {sub.categories?.map(sub2 => (
                                                            <li key={sub2.slug}>
                                                                <Link
                                                                    href={`/category/${cat.slug}/${sub.slug}/${sub2.slug}`}
                                                                    className="text-sm text-slate-700 dark:text-slate-200 hover:text-siteColors-pink dark:hover:text-siteColors-lightblue block py-1 pl-4 border-l-2 border-transparent hover:border-siteColors-pink dark:hover:border-siteColors-lightblue"
                                                                >
                                                                    {sub2.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                className="inline-flex items-center bg-gradient-to-r from-siteColors-pink to-siteColors-purple text-white px-6 py-3 rounded-lg hover:shadow-xl font-bold text-lg dark:shadow-lg dark:border-2 dark:border-siteColors-pink/40"
                                            >
                                                <FaFire className="w-5 h-5 mr-2" />
                                                {cat.description}
                                                <FaBolt className="w-5 h-5 ml-2" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Κανονικές κατηγορίες - ΒΕΛΤΙΩΜΕΝΟ CONTRAST */}
                        {regularCategories.map(cat => (
                            <div
                                key={cat.slug}
                                className={`${activeCategory === cat.slug ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
                            >
                                {cat.categories?.length > 0 ? (
                                    <>
                                        <div className="flex items-center pb-4 border-b border-slate-200 dark:border-slate-600">
                                            <h2 className="text-xl font-bold text-siteColors-blue dark:text-white">
                                                {cat.name}
                                            </h2>
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                className="ml-4 text-sm text-siteColors-lightblue hover:underline flex items-center font-medium"
                                            >
                                                Δες τα όλα
                                                <FaAngleDown className="ml-1 transform rotate-270" />
                                            </Link>
                                        </div>

                                        <div className="flex flex-wrap gap-8 mt-4">
                                            {cat.categories.map(sub => (
                                                <div key={sub.slug} className="flex-1 min-w-[200px] max-w-[300px]">
                                                    <Link href={`/category/${cat.slug}/${sub.slug}`}>
                                                        <h3 className="text-lg font-semibold text-siteColors-purple dark:text-siteColors-lightblue mb-3 pb-2 border-b border-siteColors-lightblue/20 dark:border-siteColors-lightblue/40">
                                                            {sub.name}
                                                        </h3>
                                                    </Link>
                                                    <ul className="space-y-1">
                                                        {sub.categories?.map(sub2 => (
                                                            <li key={sub2.slug}>
                                                                <Link
                                                                    href={`/category/${cat.slug}/${sub.slug}/${sub2.slug}`}
                                                                    className="text-sm text-slate-700 dark:text-slate-200 hover:text-siteColors-lightblue block py-1"
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
                                    <div className="text-center py-8">
                                        <h2 className="text-xl font-bold text-siteColors-blue dark:text-white mb-2">
                                            {cat.name}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                                            Δες τη συλλογή {cat.name}
                                        </p>
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className="inline-flex items-center px-4 py-2 bg-siteColors-lightblue text-white rounded-md hover:bg-siteColors-blue dark:bg-siteColors-lightblue dark:hover:bg-siteColors-blue"
                                        >
                                            Δες τα όλα
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