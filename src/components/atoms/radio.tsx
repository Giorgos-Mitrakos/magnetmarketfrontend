'use client'

type RadioProps = {
    id: string
    name: string,
    value: string,
    checked: boolean,
    onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
    label?: string
}

const Radio = ({ id, name, checked, onChange, value, className = "", label, ...props }: RadioProps) => (
    <div className={`flex items-center ${className}`}>
        <input 
            type="radio" 
            id={id} 
            name={name} 
            checked={checked} 
            onChange={onChange} 
            value={value} 
            className="sr-only" 
            {...props} 
        />
        <label 
            htmlFor={id} 
            className="flex items-center cursor-pointer group"
        >
            <span className={`
                flex items-center justify-center w-5 h-5 border-2 rounded-full mr-3 transition-all duration-200
                ${checked 
                    ? 'border-siteColors-purple bg-siteColors-purple' 
                    : 'border-gray-300 dark:border-slate-400 group-hover:border-siteColors-purple dark:group-hover:border-slate-200'
                }
            `}>
                {checked && (
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                )}
            </span>
            <span className="text-gray-900 dark:text-white group-hover:text-siteColors-purple dark:group-hover:text-slate-200 transition-colors duration-200">
                {label || value}
            </span>
        </label>
    </div>
);

export default Radio;