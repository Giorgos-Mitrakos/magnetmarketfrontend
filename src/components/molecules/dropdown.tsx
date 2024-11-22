import { useState, useEffect } from 'react'
import { DropdownFilter, DropdownItem } from '../organisms/categoryPageHeader';
import { FaCaretDown } from 'react-icons/fa';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';


export default function Dropdown({ items, filter }: DropdownFilter) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const search = searchParams.get(filter)
    const [selectedItem, setSelectedItem] = useState<string>(() => {
        if (search) {
            const item = items.find(item => item.route === search)
            if (item) { return item.title }
            else {
                return items[0].title
            }
        }
        else {
            return items[0].title
        }
    })

    // useEffect(() => {
    //     const search = searchParams.get(filter)
    //     setSelectedItem(search ? search : items[0].title)
    // }, [searchParams, filter, items])

    const toggle = () => {
        setIsOpen(old => !old);
    }

    const handleItemClick = (item: DropdownItem) => {
        setSelectedItem(item.title)
        toggle()
        const params = new URLSearchParams(searchParams)
        if(filter==='pageSize'){
            params.delete('page')
        }
        if (items[0] === item) {
            params.delete(filter)
        }
        else {
            params.set(filter, item.route)
        }

        router.push(pathname + '?' + params)
        // router.push( {...router, query: { filter: item.title }} )//`${item.route}`)
    }

    const transClass = isOpen
        ?
        "flex"
        :
        "hidden";

    return (
        <>
            <div className="relative flex items-center">
                <button
                    className="flex items-center hover:text-blue-400"
                    onClick={toggle}
                >
                    <span>{selectedItem}</span>
                    <FaCaretDown aria-label='Εικονίδιο για εμφάνιση λίστας ταξιμόνησης'/>
                </button>
                <div className={`absolute top-8 z-20 flex flex-col divide-y-2 bg-gray-50 dark:bg-slate-800 rounded-md overflow-hidden ${transClass}`}>
                    {
                        items.map(item =>
                            <div key={item.title}
                                className='p-4 font-normal cursor-pointer hover:bg-slate-100'
                                onClick={() => handleItemClick(item)}
                                aria-label={item.title}
                            >
                                {item.title}
                            </div>
                        )
                    }
                </div>
            </div>
            {
                isOpen
                    ?
                    <div
                        className="fixed top-0 right-0 bottom-0 left-0 z-10 bg-transparent"
                        onClick={toggle}
                    ></div>
                    :
                    <></>
            }
        </>
    )
}