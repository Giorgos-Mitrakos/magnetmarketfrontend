import HeaderActions from "../molecules/headerActions";
import Logo from "../atoms/logo";

export default function Header({user}) {
    return (
        <header className="relative flex flex-col xs:flex-row p-2  w-full h-auto justify-between"
        aria-label="Κεφαλίδα">
            <Logo />
            <HeaderActions user={user} />
        </header>
    )
}