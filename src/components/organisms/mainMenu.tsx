'use client'
import { IMenuProps } from "@/lib/interfaces/category";
import { GET_MENU } from "@/lib/queries/categoryQuery";
import { useNoRevalideteQuery } from "@/repositories/clientRepository";
import Link from "next/link";
import { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";


const MainMenu = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
    const [active, setActive] = useState("");

    const { data: menuData, loading, error } = useNoRevalideteQuery({ query: GET_MENU, jwt: '' })

    const menu = menuData as IMenuProps

    return (
        <section className={`absolute ${isMenuOpen ? "flex" : "hidden"} top-6 max-w-7xl z-20 bg-white dark:bg-slate-700 border-2 border-slate-200 cursor-default rounded-md`}>
            <ul className="flex flex-col pt-4 border-slate-200">
                {menu && menu.categories.data.map(cat => (
                    cat.attributes.name !== "Uncategorized" && 
                    <li className="flex w-64 justify-between pl-6 py-2 text-sm cursor-pointer hover:bg-siteColors-lightblue" key={cat.attributes.slug} onMouseEnter={(e) => setActive(cat.attributes.slug)}>
                        <Link href={`/category/${cat.attributes.slug}`}>
                            <h3>{cat.attributes.name}</h3>
                        </Link>
                        {cat.attributes.categories.data.length > 0 &&
                            <FaAngleRight className="pr-2 text-slate-500 dark:text-slate-300" />}
                    </li>
                ))}
            </ul>
            {menu && menu.categories.data.map(cat => (
                <div key={cat.attributes.slug}>
                    <ul className={`${active === cat.attributes.slug ? "grid" : "hidden"}
                        grid-cols-5 w-full max-w-full min-h-full z-10 bg-white dark:bg-slate-700`}>
                        {cat.attributes.categories.data.map(sub => (
                            <li key={sub.attributes.slug} className="w-44 mt-4 pl-8">
                                <Link href={`/category/${cat.attributes.slug}/${sub.attributes.slug}`}>
                                    <h3 className="text-sm text-black dark:text-slate-200 font-semibold pr-4 mb-4">{sub.attributes.name}</h3>
                                </Link>
                                <ul className="flex flex-col">
                                    {sub.attributes.categories.data.map(sub2 => (
                                        <li key={sub2.attributes.slug}>
                                            <Link href={`/category/${cat.attributes.slug}/${sub.attributes.slug}/${sub2.attributes.slug}`}>
                                                <h3 className='text-sm cursor-pointer hover:text-siteColors-lightblue mb-2
                                                relative after:duration-300
                            after:absolute after:content-[""] after:h-[1px] after:bg-siteColors-lightblue after:w-0 hover:after:w-full
                            after:left-0 after:-bottom-[2px] after:rounded-xl'>{sub2.attributes.name}</h3>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>
    )
}

export default MainMenu