import Link from "next/link";

export interface IconLinkProps {
    icon: React.ReactNode;
    url: string;
    "aria-label": string;
}

function IconLink(props: IconLinkProps) {
    return (
        <Link href={props.url} className=" text-siteColors-purple dark:text-slate-800 text-xl p-3 xs:text-2xl sm:p-4 md:text-3xl"
            aria-label={props["aria-label"]}>
            {props.icon}
        </Link>
    )
}

export default IconLink