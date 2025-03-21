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
        <div className='dark:bg-slate-700'>
            <h2 className='border-b-2 border-black dark:border-slate-300 py-2 text-lg'>{response.categories.data[0]?.attributes.name}</h2>
            <ul className='mt-4'>
                {response.categories.data[0]?.attributes.categories.data.map(sub => (
                    <li className='' key={sub.attributes.slug} >
                        <Link href={`/category/${props.category1}/${sub.attributes.slug}`}
                            className='font-semibold text-sm'>{sub.attributes.name}</Link>
                        <ul>
                            {sub.attributes.slug === props.category2 && sub.attributes.categories.data.map(sub2 => (
                                <li className='text-base space-y-3 ml-1' key={sub2.attributes.slug}>
                                    <Link href={`/category/${props.category1}/${sub.attributes.slug}/${sub2.attributes.slug}`}>{sub2.attributes.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Menu