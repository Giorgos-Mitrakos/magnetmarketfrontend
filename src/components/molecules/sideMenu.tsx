import { IcategoryProps } from '@/lib/interfaces/category';
import { GET_CATEGORY } from '@/lib/queries/categoryQuery';
import { requestSSR } from '@/repositories/repository';
import Link from 'next/link';

export interface MenuProps {
    category1: string,
    category2: string | null,
    category3: string | null
}

const Menu = async (props: MenuProps) => {
    const data = await requestSSR({
        query: GET_CATEGORY, variables: { category: props.category1 }
    });

    const response = data as IcategoryProps

    return (
        <div className='bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-slate-700'>
            <h2 className='border-b border-gray-200 dark:border-slate-600 pb-3 text-xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight'>
                {response.categories.data[0]?.attributes.name}
            </h2>
            <ul className='mt-5 space-y-4'>
                {response.categories.data[0]?.attributes.categories.data.map(sub => (
                    <li key={sub.attributes.slug}>
                        <Link 
                            href={`/category/${props.category1}/${sub.attributes.slug}`}
                            className={`block py-2 px-3 rounded-lg text-base font-medium transition-colors ${
                                sub.attributes.slug === props.category2
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                    : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {sub.attributes.name}
                        </Link>
                        {sub.attributes.slug === props.category2 && (
                            <ul className='mt-2 ml-5 pl-4 border-l border-gray-200 dark:border-slate-600 space-y-3'>
                                {sub.attributes.categories.data.map(sub2 => (
                                    <li key={sub2.attributes.slug}>
                                        <Link 
                                            href={`/category/${props.category1}/${sub.attributes.slug}/${sub2.attributes.slug}`}
                                            className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                                                sub2.attributes.slug === props.category3
                                                    ? 'text-blue-600 font-medium dark:text-blue-400'
                                                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {sub2.attributes.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Menu