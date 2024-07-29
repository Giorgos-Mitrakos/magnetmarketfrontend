export interface SiteFeatureProps {
    icon: React.ReactNode;
    header: string;
    content: string;
    "aria-label": string;
    "aria-description": string;
}

const SiteFeature = (props: SiteFeatureProps) => {
    {
        return (
            <div className="flex p-4 min-w-max">
                <div className="flex text-3xl md:text-2xl text-siteColors-lightblue">
                    {props.icon}
                </div>
                <div className="pl-4">
                    <h4 className="text-sm md:text-base lg:text-base font-semibold"
                    aria-label={props["aria-label"]}>{props.header}</h4>
                    <p className="text-xs break-words md:text-xs lg:text-xs text-slate-500"
                    aria-label={props["aria-description"]}>{props.content}</p>
                </div>
            </div>
        )
    }
}

export default SiteFeature;