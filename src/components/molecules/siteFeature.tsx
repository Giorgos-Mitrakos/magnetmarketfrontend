export interface SiteFeatureProps {
    icon: React.ReactNode;
    header: string;
    content: string;
    "aria-label": string;
    isLast?: boolean;
    isMobile?: boolean;
}

const SiteFeature = (props: SiteFeatureProps) => {
    return (
        <div 
            className={`flex items-start p-4 md:p-5 w-full group rounded-lg transition-all duration-300 ease-in-out border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md ${props.isMobile ? '' : 'md:hover:-translate-y-1'}`}
            aria-label={props["aria-label"]}
        >
            <div className="flex-shrink-0 mt-1">
                <div className={`flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300 ${props.isMobile ? 'w-10 h-10' : 'w-10 h-10 md:w-12 md:h-12'}`}>
                    <div className={`${props.isMobile ? 'text-xl' : 'text-xl md:text-2xl'}`}>
                        {props.icon}
                    </div>
                </div>
            </div>
            
            <div className="pl-4">
                <h3 className={`font-semibold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-siteColors-lightblue dark:group-hover:text-blue-400 transition-colors duration-300 ${props.isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                    {props.header}
                </h3>
                <p className={`text-slate-600 dark:text-slate-300 leading-tight ${props.isMobile ? 'text-xs' : 'text-xs md:text-sm'}`}>
                    {props.content}
                </p>
            </div>
        </div>
    )
}

export default SiteFeature;