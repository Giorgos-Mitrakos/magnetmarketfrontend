import Link from 'next/link';
import { AiOutlineRight, AiOutlineHome } from 'react-icons/ai';

const Breadcrumb = ({ breadcrumbs }: { breadcrumbs: { title: string, slug: string }[] }) => {

    return (
        <nav className="flex mt-2 ml-2" aria-label="Breadcrumb">
            <ul className="hidden sm:inline-flex flex-wrap items-center space-x-1">

                {breadcrumbs.map((item, index) => {
                    if (item.title === 'Home') {
                        return (
                            <li key={index} className="inline-flex items-center">
                                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                                    <AiOutlineHome className='mr-1' />
                                    <span aria-label='Αρχική'>Αρχική</span>
                                </Link>
                            </li>)
                    }
                    else {
                        if (index === breadcrumbs.length - 1) {
                            return (
                                <li aria-current="page" key={index}>
                                    <div className="flex items-center">
                                        <AiOutlineRight className="pr-1 text-slate-500" />
                                        <span className="ml-1 text-sm font-medium text-slate-500 md:ml-2 dark:text-slate-500"
                                            aria-label={item.title}>{item.title}</span>
                                    </div>
                                </li>
                            )
                        }
                        else {
                            return (
                                <li key={index}>
                                    <div className="flex items-center ">
                                        <AiOutlineRight className="pr-1 text-slate-500" />
                                        <Link href={`${item.slug}`} className="ml-1 text-sm font-medium text-slate-500 hover:text-slate-700 md:ml-2 dark:text-slate-400 dark:hover:text-white"
                                            aria-label={item.title}>
                                            {item.title}
                                        </Link>
                                    </div>
                                </li>)
                        }
                    }
                }
                )}
            </ul>
        </nav >
    )
}

export default Breadcrumb;
