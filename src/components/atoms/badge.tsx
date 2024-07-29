interface BadgeProps {
    text: string
    backgroundColor: string
}

const Badge = (props: BadgeProps) => {


    return (
        <span className={`${props.backgroundColor} text-white text-sm font-bold px-1.5 py-1 rounded dark:bg-red-200 dark:text-red-900`}>
            {props.text}
        </span>
    )
}

export default Badge;