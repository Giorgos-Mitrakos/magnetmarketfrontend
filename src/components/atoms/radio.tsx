'use client'

type RadioProps = {
    id: string
    name: string,
    value: string,
    checked: boolean,
    onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void
}

const Radio = ({ id, name, checked, onChange, value, ...props }: RadioProps) => (
    <div className="flex gap-2 items-center">
        <input type="radio" id={id} name={name} checked={checked} onChange={onChange} {...props}
            className="w-4 h-4 border-2 border-blue-500 rounded-full" value={value} />
        <label htmlFor={id} className="text-sm tracking-wide">{value}</label>
    </div>
);

export default Radio;