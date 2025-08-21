"use client"

import { GET_MENU } from "@/lib/queries/categoryQuery"
import { useNoRevalideteQuery } from "@/repositories/clientRepository"
import Link from "next/link"
import { useContext, useState, useMemo, useCallback } from "react"
import NextImage from "../atoms/nextImage"
import { FaArrowLeftLong, FaRegImage } from "react-icons/fa6";
import { AiOutlineClose } from "react-icons/ai";
import { MenuContext } from "@/context/menu"
import { useRouter } from "next/navigation"
import { IMenuProps } from "@/lib/interfaces/category"
import { IImageAttr } from "@/lib/interfaces/image"

// Define proper interfaces based on the actual data structure
interface IBaseCategoryProps {
    attributes: {
        name: string
        slug: string
        image: { data: IImageAttr | null }
    }
}

interface IMenuCategoryProps extends IBaseCategoryProps {
    attributes: IBaseCategoryProps['attributes'] & {
        categories: { data: IMenuSubCategoryProps[] }
    }
}

interface IMenuSubCategoryProps extends IBaseCategoryProps {
    attributes: IBaseCategoryProps['attributes'] & {
        categories: { data: IMenuSub2CategoryProps[] }
    }
}

interface IMenuSub2CategoryProps extends IBaseCategoryProps {
    // Sub2 categories don't have nested categories
}

// Helper function to check if category has image data
const hasImageData = (category: IBaseCategoryProps): boolean => {
    return !!category.attributes.image?.data;
};

// Extract common category item component to reduce duplication
const CategoryItem = ({
    category,
    onClick,
    isButton = false
}: {
    category: IBaseCategoryProps,
    onClick: () => void,
    isButton?: boolean
}) => {
    const hasImage = hasImageData(category);

    const content = (
        <div className="flex flex-col items-center p-2">
            <div className="flex items-center justify-center w-20 h-20 mb-3 rounded-full bg-white shadow-md
                      dark:bg-white">
                {hasImage ? (
                    <div className="w-14 h-14 flex items-center justify-center rounded-full ">
                        <NextImage
                            media={category.attributes.image.data!.attributes}
                            width={56}
                            height={56}
                        />
                    </div>
                ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-full">
                        <FaRegImage className="w-8 h-8 text-gray-500" />
                    </div>
                )}
            </div>
            <p className="break-words text-wrap text-center text-sm font-medium text-gray-700 dark:text-white px-1">
                {category.attributes.name}
            </p>
        </div>
    );

    return isButton ? (
        <button onClick={onClick} className="w-full">
            {content}
        </button>
    ) : (
        <Link href="#" onClick={onClick} className="block">
            {content}
        </Link>
    );
};

// Extract drawer header component to reduce duplication
// Στο DrawerHeader component, αλλάξτε τα χρώματα:
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
                    className="flex items-center text-gray-800 dark:text-white text-sm p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-siteColors-lightblue/30 transition-colors"
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
                    className="p-2 text-gray-800 dark:text-white hover:bg-blue-100 dark:hover:bg-siteColors-lightblue/30 rounded-lg transition-colors"
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
        subcategory?.attributes.categories.data.filter(
            cat => cat.attributes.name !== "Uncategorized"
        ) || [],
        [subcategory]
    );

    return (
        <div className="h-screen absolute top-0 left-0 w-full bg-gradient-to-b from-blue-100 to-purple-100
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
            <div className="p-4 h-[calc(100%-60px)]">
                <DrawerHeader
                    title={subcategory?.attributes.name || ""}
                    onBack={closeSubCategoryDrawer}
                />

                <div className="h-full overflow-y-auto">
                    <ul className="pb-32 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6">
                        {filteredCategories.map(cat => (
                            <li key={cat.attributes.slug}>
                                <Link
                                    onClick={closeMenu}
                                    href={`/category/${category}/${subcategory?.attributes.slug}/${cat.attributes.slug}`}
                                    className="block"
                                >
                                    <CategoryItem category={cat} onClick={closeMenu} />
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
        category?.attributes.categories.data.filter(
            cat => cat.attributes.name !== "Uncategorized"
        ) || [],
        [category]
    );

    const handleOnclickSub = useCallback((cat: IMenuSubCategoryProps) => {
        if (cat.attributes.categories.data.length > 0) {
            setSubCategory(cat);
            openSubCategoryDrawer();
        } else {
            if (category) {
                router.push(`/category/${category.attributes.slug}/${cat.attributes.slug}`);
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
                        category={category.attributes.slug}
                        subcategory={subCategory}
                    />
                </div>
            )}

            <div className="p-4 h-[calc(100%-60px)]">
                <DrawerHeader
                    title={category?.attributes.name || ""}
                    onBack={closeCategoryDrawer}
                />

                <div className="h-full overflow-y-auto">
                    <ul className="pb-32 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6">
                        {filteredCategories.map(cat => (
                            <li key={cat.attributes.slug}>
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

export default function MobileDrawer() {
    const router = useRouter();
    const { isCategoriesOpen, openCategoryDrawer, closeMenuDrawer } = useContext(MenuContext);
    const { data: menuData, loading, error } = useNoRevalideteQuery({
        query: GET_MENU,
        jwt: ''
    });

    const menu = menuData as IMenuProps;
    const [category, setCategory] = useState<IMenuCategoryProps | null>(null);

    // Filter out uncategorized categories
    const filteredCategories = useMemo(() =>
        menu?.categories.data.filter(
            cat => cat.attributes.name !== "Uncategorized"
        ) || [],
        [menu]
    );

    const handleOnclickSub = useCallback((category: IMenuCategoryProps) => {
        if (category.attributes.categories.data.length > 0) {
            setCategory(category);
            openCategoryDrawer();
        } else {
            router.push(`/category/${category.attributes.slug}`);
            closeMenuDrawer();
        }
    }, [router, openCategoryDrawer, closeMenuDrawer]);

    if (loading) {
        return (
            <div className="h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
                <div className="text-gray-700 dark:text-white">Φόρτωση...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center
                dark:bg-gradient-to-b dark:from-siteColors-blue dark:to-siteColors-purple">
                <div className="text-gray-700 dark:text-white">Προέκυψε σφάλμα</div>
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
                    showBackButton={false} // Απενεργοποίηση βελακιού
                    showCloseButton={true}
                    onClose={closeMenuDrawer}
                />

                <div className="h-full overflow-y-auto">
                    <ul className="pb-20 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6">
                        {filteredCategories.map(cat => (
                            <li key={cat.attributes.slug}>
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