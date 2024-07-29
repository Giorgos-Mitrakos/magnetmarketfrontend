'use client'

interface RadioProps {
    id: string
    label: string,
    name: string,
    isChecked: boolean,
    onChange: () => void
}

const Radio = ({ id, name, label, isChecked, onChange }: RadioProps) => (
    <div className="flex gap-2 items-center">
        <input type="radio" id={id} name={name} checked={isChecked} onChange={onChange}
            className="w-4 h-4 border-2 border-blue-500 rounded-full" />
        <label htmlFor={id} className="text-sm tracking-wide">{label}</label>
    </div>
);

export default Radio;