import Link from 'next/link';

export interface FooterSectionProps {
    label: string;
    links: [
        {
            id: string,
            label: string,
            isLink: boolean,
            href: string,
            target:string
        }
    ]
}

const FooterSection = (props: FooterSectionProps) => {
    return (
        <div className='flex flex-col space-y-4 mr-8 mb-8 text-siteColors-purple dark:text-slate-300'>
            <h2 className='text-lg uppercase font-semibold'
            aria-label={props.label}>{props.label}</h2>
            <ul>
                {props.links.map(link => (
                    <li key={link.id} className='w-auto'>
                        {link.isLink ?
                            <Link href={link.href} target={link.target} className='relative after:duration-300
                            after:absolute after:content-[""] after:h-[1px] after:bg-siteColors-purple  dark:after:bg-slate-300 after:w-0 hover:after:w-full
                            after:left-0 after:-bottom-[2px] after:rounded-xl'
                            aria-label={link.label}>
                                {link.label}
                                {/* <span className='block max-w-0 group-hover:max-w-full h-0.5 transition-all duration-500 bg-gray-600'></span> */}
                            </Link> :
                            <span aria-label={link.label}>{link.label}</span>
                        }
                    </li>
                ))}
            </ul >
        </div>
    )
}

export default FooterSection