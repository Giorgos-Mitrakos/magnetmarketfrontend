import Link from 'next/link';
import { AiOutlineRight, AiOutlineHome } from 'react-icons/ai';

const Breadcrumb = ({ breadcrumbs }: { breadcrumbs: { title: string, slug: string }[] }) => {

    return (
        <nav className="flex mt-4 mb-4" aria-label="Breadcrumb">
            <ul className="flex flex-wrap items-center space-x-1 text-sm">
                {breadcrumbs.map((item, index) => {
                    if (item.title === 'Home') {
                        return (
                            <li key={index} className="inline-flex items-center">
                                <Link 
                                    href="/" 
                                    className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 dark:text-slate-300 dark:hover:text-white"
                                >
                                    <AiOutlineHome className='mr-1.5 text-lg' />
                                    <span className="font-medium" aria-label='Αρχική'>Αρχική</span>
                                </Link>
                            </li>
                        )
                    }
                    else {
                        if (index === breadcrumbs.length - 1) {
                            return (
                                <li aria-current="page" key={index}>
                                    <div className="flex items-center">
                                        <AiOutlineRight className="mx-1.5 text-slate-400 text-xs" />
                                        <span className="font-semibold text-slate-800 dark:text-slate-100" aria-label={item.title}>
                                            {item.title}
                                        </span>
                                    </div>
                                </li>
                            )
                        }
                        else {
                            return (
                                <li key={index}>
                                    <div className="flex items-center">
                                        <AiOutlineRight className="mx-1.5 text-slate-400 text-xs" />
                                        <Link 
                                            href={`${item.slug}`} 
                                            className="font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 dark:text-slate-300 dark:hover:text-white"
                                            aria-label={item.title}
                                        >
                                            {item.title}
                                        </Link>
                                    </div>
                                </li>
                            )
                        }
                    }
                })}
            </ul>
        </nav>
    )
}

export default Breadcrumb;