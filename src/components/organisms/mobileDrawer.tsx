"use client"

import Link from "next/link"
import { useContext, useState, useMemo, useCallback } from "react"
import NextImage from "../atoms/nextImage"
import { FaArrowLeftLong, FaRegImage, FaFire } from "react-icons/fa6";
import { AiOutlineClose } from "react-icons/ai";
import { MenuContext } from "@/context/menu"
import { useRouter } from "next/navigation"
import { IMenuProps } from "@/lib/interfaces/category"
import { IImageAttr } from "@/lib/interfaces/image"
import { MenuData } from "./mainMenu";

// Define proper interfaces based on the actual data structure
interface IBaseCategoryProps {
    name: string
    description: string,
    slug: string
    image: IImageAttr | null
    isSpecial?: boolean
}

interface IMenuCategoryProps extends IBaseCategoryProps {
    categories: IMenuSubCategoryProps[]
}

interface IMenuSubCategoryProps extends IBaseCategoryProps {
    categories: IMenuSub2CategoryProps[]
}

interface IMenuSub2CategoryProps extends IBaseCategoryProps {
    // Sub2 categories don't have nested categories
}

// Προσθήκη interface για props
interface MobileDrawerProps {
    menuData?: MenuData[];
}

// Helper function to check if category has image data
const hasImageData = (category: IBaseCategoryProps): boolean => {
    return !!category.image
};

// Extract common category item component to reduce duplication
const CategoryItem = ({
    category,
    onClick,
    isButton = false,
    isSpecial = false
}: {
    category: IBaseCategoryProps,
    onClick: () => void,
    isButton?: boolean,
    isSpecial?: boolean
}) => {
    const hasImage = hasImageData(category);

    const content = (
        <div className="flex flex-col items-center p-2">
            <div className={`flex items-center justify-center w-20 h-20 mb-3 rounded-full shadow-md transition-all duration-200
                      ${isSpecial ?
                    'bg-gradient-to-br from-siteColors-purple/20 to-siteColors-pink/20 border-2 border-siteColors-purple' :
                    'bg-white dark:bg-white border-2 border-transparent'}`}>
                {hasImage ? (
                    <div className="w-14 h-14 flex items-center justify-center rounded-full">
                        <NextImage
                            media={category.image!}
                            width={56}
                            height={56}
                        />
                    </div>
                ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-full">
                        {isSpecial ? (
                            <FaFire className="w-6 h-6 text-siteColors-purple" />
                        ) : (
                            <FaRegImage className="w-8 h-8 text-gray-500" />
                        )}
                    </div>
                )}
            </div>
            <p className={`break-words text-wrap text-center text-sm px-1 transition-colors duration-200
                ${isSpecial ?
                    'text-siteColors-purple dark:text-siteColors-lightblue font-bold' :
                    'text-gray-700 dark:text-white font-medium'}`}>
                {category.name}
            </p>
        </div>
    );

    return isButton ? (
        <button onClick={onClick} className="w-full relative hover:scale-105 transition-transform duration-200">
            {content}
        </button>
    ) : (
        <>
            {content}
        </>
    );
};

// Special Category Button Component
const SpecialCategoryButton = ({
    category,
    onClick,
    isFirst = false
}: {
    category: IBaseCategoryProps,
    onClick: () => void,
    isFirst?: boolean
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isFirst ? '' : 'mt-3'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                        <FaFire className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        {category.description && <p className="text-sm mb-4 text-start">
                            {category.description}
                        </p>}
                    </div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <FaArrowLeftLong className="w-4 h-4 text-white transform rotate-180" />
                </div>
            </div>
        </button>
    );
};

// Extract drawer header component
const DrawerHeader = ({
    title,
    onBack,
    showBackButton = true,
    showCloseButton = false,
    onClose
}: {
    title: string,
    onBack: () => void,
    showBackButton?: boolean,
    showCloseButton?: boolean,
    onClose?: () => void
}) => (
    <div className="grid grid-cols-3 items-center mb-6">
        <div className="flex justify-start">
            {showBackButton && (
                <button
                    className="flex items-center text-gray-800 dark:text-white text-sm p-2 rounded-lg hover:bg-siteColors-lightblue/10 transition-colors"
                    onClick={onBack}
                >
                    <FaArrowLeftLong className="w-4 h-4 mr-2" />
                </button>
            )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
            {title}
        </h3>

        <div className="flex justify-end">
            {showCloseButton && (
                <button
                    onClick={onClose}
                    className="p-2 text-gray-800 dark:text-white hover:bg-siteColors-lightblue/10 rounded-lg transition-colors"
                >
                    <AiOutlineClose className="text-xl" />
                </button>
            )}
        </div>
    </div>
);

function Sub2categoryDrawer({ category, subcategory }: {
    category: string,
    subcategory: IMenuSubCategoryProps | null
}) {
    const { closeMenu, closeSubCategoryDrawer } = useContext(MenuContext);

    // Filter out uncategorized categories
    const filteredCategories = useMemo(() =>
        subcategory?.categories.filter(
            cat => cat.name !== "Uncategorized"
        ) || [],
        [subcategory]
    );

    return (
        <div className="h-screen absolute top-0 left-0 w-full bg-gradient-to-b from-blue-100 to-purple-100
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
            <div className="p-4 h-[calc(100%-60px)]">
                <DrawerHeader
                    title={subcategory?.name || ""}
                    onBack={closeSubCategoryDrawer}
                />

                <div className="h-full overflow-y-auto">
                    <ul className="pb-32 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6">
                        {filteredCategories.map(cat => (
                            <li key={cat.slug}>
                                <Link
                                    onClick={closeMenu}
                                    href={`/category/${category}/${subcategory?.slug}/${cat.slug}`}
                                    className="block hover:scale-105 transition-transform duration-200"
                                >
                                    <CategoryItem
                                        category={cat}
                                        onClick={closeMenu}
                                        isSpecial={cat.isSpecial}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function SubcategoryDrawer({ category }: {
    category: IMenuCategoryProps | null
}) {
    const router = useRouter();
    const { isSubCategoriesOpen, openSubCategoryDrawer, closeCategoryDrawer, closeMenuDrawer } = useContext(MenuContext);
    const [subCategory, setSubCategory] = useState<IMenuSubCategoryProps | null>(null);

    // Filter out uncategorized categories
    const filteredCategories = useMemo(() =>
        category?.categories.filter(
            cat => cat.name !== "Uncategorized"
        ) || [],
        [category]
    );

    const handleOnclickSub = useCallback((cat: IMenuSubCategoryProps) => {
        if (cat.categories.length > 0) {
            setSubCategory(cat);
            openSubCategoryDrawer();
        } else {
            if (category) {
                router.push(`/category/${category.slug}/${cat.slug}`);
                closeMenuDrawer();
            }
        }
    }, [category, router, openSubCategoryDrawer, closeMenuDrawer]);

    return (
        <div className="h-screen absolute top-0 left-0 w-full bg-gradient-to-b from-blue-100 to-purple-100
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
            {category && isSubCategoriesOpen && (
                <div className={`absolute lg:hidden bottom-0 left-0 z-30 h-full w-full transition-transform transform ${isSubCategoriesOpen ? "translate-x-0" : "-translate-x-full"
                    } duration-300`}>
                    <Sub2categoryDrawer
                        category={category.slug}
                        subcategory={subCategory}
                    />
                </div>
            )}

            <div className="p-4 h-[calc(100%-60px)]">
                <DrawerHeader
                    title={category?.name || ""}
                    onBack={closeCategoryDrawer}
                />

                <div className="h-full overflow-y-auto">
                    <ul className="pb-32 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6">
                        {filteredCategories.map(cat => (
                            <li key={cat.slug}>
                                <CategoryItem
                                    category={cat}
                                    onClick={() => handleOnclickSub(cat)}
                                    isButton={true}
                                    isSpecial={cat.isSpecial}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function MobileDrawer({ menuData }: { menuData: MenuData[] }) {
    const router = useRouter();
    const { isCategoriesOpen, openCategoryDrawer, closeMenuDrawer } = useContext(MenuContext);
    const [category, setCategory] = useState<IMenuCategoryProps | null>(null);

    // Χρήση των προ-φορτωμένων δεδομένων
    const menu = menuData;

    // Filter out uncategorized categories
    const filteredCategories = useMemo(() =>
        menu?.filter(
            cat => cat.name !== "Uncategorized"
        ) || [],
        [menu]
    );

    // Διάκριση κατηγοριών
    const regularCategories = filteredCategories.filter(cat => !cat.isSpecial);
    const specialCategories = filteredCategories.filter(cat => cat.isSpecial);

    const handleOnclickSub = useCallback((category: IMenuCategoryProps) => {
        if (category.categories.length > 0) {
            setCategory(category);
            openCategoryDrawer();
        } else {
            router.push(`/category/${category.slug}`);
            closeMenuDrawer();
        }
    }, [router, openCategoryDrawer, closeMenuDrawer]);

    // Εάν δεν υπάρχουν δεδομένα, δείξε loading
    if (!menu) {
        return (
            <div className="h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
                <div className="text-gray-700 dark:text-white">Φόρτωση...</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-b from-blue-100 to-purple-100 
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
            {isCategoriesOpen && (
                <div className={`absolute lg:hidden bottom-0 left-0 z-20 h-full w-full transition-transform transform ${isCategoriesOpen ? "translate-x-0" : "-translate-x-full"
                    } duration-300`}>
                    <SubcategoryDrawer category={category} />
                </div>
            )}

            <div className="p-4 h-[calc(100%-60px)]">
                <DrawerHeader
                    title="Κατηγορίες"
                    onBack={closeMenuDrawer}
                    showBackButton={false}
                    showCloseButton={true}
                    onClose={closeMenuDrawer}
                />

                {/* Ειδική ενότητα για Ευκαιρίες - Απλοποιημένη */}
                {specialCategories.length > 0 && (
                    <div className="mb-6">
                        <div className="mb-4">
                            <div className="space-y-3">
                                {specialCategories.map((cat, index) => (
                                    <SpecialCategoryButton
                                        key={cat.slug}
                                        category={cat}
                                        onClick={() => handleOnclickSub(cat)}
                                        isFirst={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-full overflow-y-auto">
                    {specialCategories.length > 0 && (
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 mt-2">
                            Όλες οι Κατηγορίες
                        </h3>
                    )}
                    <ul className="pb-20 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6">
                        {regularCategories.map(cat => (
                            <li key={cat.slug}>
                                <CategoryItem
                                    category={cat}
                                    onClick={() => handleOnclickSub(cat)}
                                    isButton={true}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}