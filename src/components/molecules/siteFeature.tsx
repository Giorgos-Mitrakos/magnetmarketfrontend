export interface SiteFeatureProps {
    icon: React.ReactNode;
    header: string;
    content: string;
    "aria-label": string;
    // "aria-description": string;
}

const SiteFeature = (props: SiteFeatureProps) => {
    {
        return (
            <div className="flex p-4 min-w-max">
                <div className="flex text-3xl md:text-2xl text-siteColors-lightblue dark:text-slate-200">
                    {props.icon}
                </div>
                <div className="pl-4">
                    <h2 className="text-sm md:text-base lg:text-base font-semibold dark:text-slate-200 "
                        aria-label={props["aria-label"]}>
                        {props.header}
                        <p className="text-xs font-normal break-words md:text-xs lg:text-xs text-slate-600 dark:text-slate-300">
                            {props.content}</p>
                    </h2>

                </div>
            </div>
        )
    }
}

export default SiteFeature;